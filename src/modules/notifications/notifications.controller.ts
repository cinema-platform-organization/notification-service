import type {
	EmailChangedEvent,
	OtpRequestedEvent,
	PhoneChangedEvent,
} from "@cinema-platform/contracts";
import { Controller, Logger } from "@nestjs/common";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import { Counter, Histogram } from "prom-client";

import { RmqService } from "@/infrastructure/rmq/rmq.service";

import { NotificationsService } from "./notifications.service";

@Controller()
export class NotificationsController {
	private readonly SERVICE_NAME: string;

	private readonly logger = new Logger(NotificationsController.name);

	public constructor(
		private readonly notificationsService: NotificationsService,
		private readonly rmqService: RmqService,
		@InjectMetric("rmq_event_processing_duration_seconds")
		private readonly processingDuration: Histogram<string>,
		@InjectMetric("rmq_events_total")
		private readonly eventsTotal: Counter<string>,
	) {
		this.SERVICE_NAME = "notification";
	}

	@EventPattern("auth.otp.requested")
	public async otpRequested(
		@Payload() data: OtpRequestedEvent,
		@Ctx() ctx: RmqContext,
	) {
		const event = "auth.otp.requested";
		const endTimer = this.processingDuration.startTimer({
			service: this.SERVICE_NAME,
			event,
		});

		try {
			await this.notificationsService.sendOtp(data);

			this.eventsTotal.inc({
				service: this.SERVICE_NAME,
				event,
				status: "success",
			});

			this.rmqService.ack(ctx, event);
		} catch (error) {
			this.eventsTotal.inc({
				service: this.SERVICE_NAME,
				event,
				status: "error",
			});

			const message =
				error instanceof Error ? error.message : String(error);

			this.logger.error("OTP processing error: ", message);
			this.rmqService.nack(ctx, event);

			throw error;
		} finally {
			endTimer();
		}
	}

	@EventPattern("account.email.changed")
	public async emailChanged(
		@Payload() data: EmailChangedEvent,
		@Ctx() ctx: RmqContext,
	) {
		const event = "account.email.changed";
		const endTimer = this.processingDuration.startTimer({
			service: this.SERVICE_NAME,
			event,
		});

		try {
			await this.notificationsService.sendEmailChange(data);

			this.eventsTotal.inc({
				service: this.SERVICE_NAME,
				event,
				status: "success",
			});

			this.rmqService.ack(ctx, event);
		} catch (error) {
			this.eventsTotal.inc({
				service: this.SERVICE_NAME,
				event,
				status: "error",
			});

			const message =
				error instanceof Error ? error.message : String(error);

			this.logger.error("Email change error: ", message);
			this.rmqService.nack(ctx, event);
		} finally {
			endTimer();
		}
	}

	@EventPattern("account.phone.changed")
	public async phoneChanged(
		@Payload() data: PhoneChangedEvent,
		@Ctx() ctx: RmqContext,
	) {
		const event = "account.email.changed";
		const endTimer = this.processingDuration.startTimer({
			service: this.SERVICE_NAME,
			event,
		});

		try {
			await this.notificationsService.sendPhoneChange(data);

			this.eventsTotal.inc({
				service: this.SERVICE_NAME,
				event,
				status: "success",
			});

			this.rmqService.ack(ctx, event);
		} catch (error) {
			this.eventsTotal.inc({
				service: this.SERVICE_NAME,
				event,
				status: "error",
			});

			const message =
				error instanceof Error ? error.message : String(error);

			this.logger.error("Phone change error: ", message);
			this.rmqService.nack(ctx, event);
		} finally {
			endTimer();
		}
	}
}
