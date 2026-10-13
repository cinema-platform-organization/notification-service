import { Injectable, Logger } from "@nestjs/common";
import { RmqContext } from "@nestjs/microservices";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import type { Channel, Message } from "amqplib";
import { Counter } from "prom-client";

const RETRY_HEADER = "x-retry-count";

@Injectable()
export class RmqService {
	private readonly logger = new Logger(RmqService.name);

	public constructor(
		@InjectMetric("rmq_events_ack_total")
		private readonly ackTotal: Counter<string>,
		@InjectMetric("rmq_events_nack_total")
		private readonly nackTotal: Counter<string>,
	) {}

	public ack(context: RmqContext, event: string): void {
		const channel = context.getChannelRef() as Channel;
		const msg = context.getMessage() as Message;
		const tag = msg?.fields?.deliveryTag;

		if (!tag) {
			return;
		}

		channel.ack(msg);

		this.ackTotal.inc({ event });

		this.logger.debug({ pattern: context.getPattern(), event, tag }, "ACK");
	}

	public nack(
		context: RmqContext,
		event: string,
		requeue = false,
		error?: unknown,
	): void {
		const channel = context.getChannelRef() as Channel;
		const msg = context.getMessage() as Message;
		const tag = msg?.fields?.deliveryTag;

		if (!tag) {
			return;
		}

		channel.nack(msg, false, requeue);

		this.nackTotal.inc({ event });

		if (requeue) {
			this.logger.warn(
				{
					err: error as Error,
					pattern: context.getPattern(),
					event,
					tag,
				},
				"NACK requeue",
			);
		} else {
			this.logger.error(
				{
					err: error as Error,
					pattern: context.getPattern(),
					event,
					tag,
				},
				"NACK drop",
			);
		}
	}

	/**
	 * Republishes a failed message with a retry counter and a growing delay.
	 * After `maxRetries` attempts the message is dropped and logged as an error.
	 */
	public async retryOrDrop(
		context: RmqContext,
		event: string,
		error: unknown,
		maxRetries = 3,
	): Promise<void> {
		const channel = context.getChannelRef() as Channel;
		const msg = context.getMessage() as Message;
		const tag = msg?.fields?.deliveryTag;

		if (!tag) {
			return;
		}

		const headers = msg.properties.headers ?? {};
		const attempt = Number(headers[RETRY_HEADER] ?? 0) + 1;

		if (attempt > maxRetries) {
			this.nack(context, event, false, error);
			return;
		}

		this.logger.warn(
			{ err: error as Error, event, attempt, maxRetries },
			"Event failed, scheduling retry",
		);

		await new Promise(resolve => setTimeout(resolve, attempt * 2000));

		channel.sendToQueue(msg.fields.routingKey, msg.content, {
			...msg.properties,
			headers: { ...headers, [RETRY_HEADER]: attempt },
		});
		channel.ack(msg);
	}
}
