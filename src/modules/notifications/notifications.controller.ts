import type {
	EmailChangedEvent,
	OtpRequestedEvent,
	PhoneChangedEvent,
} from "@cinema-platform/contracts";
import { Controller } from "@nestjs/common";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import { Counter, Histogram } from "prom-client";

import { RmqService } from "@/infrastructure/rmq/rmq.service";

import { NotificationsService } from "./notifications.service";

@Controller()
export class NotificationsController {
	public constructor(
		private readonly notificationsService: NotificationsService,
		private readonly rmqService: RmqService,
		@InjectMetric("rmq_event_processing_duration_seconds")
		private readonly processingDuration: Histogram<string>,
		@InjectMetric("rmq_events_total")
		private readonly eventsTotal: Counter<string>,
	) {}

	@EventPattern("auth.otp.requested")
	public async otpRequested(
		@Payload() data: OtpRequestedEvent,
		@Ctx() ctx: RmqContext,
	) {
		const event = "auth.otp.requested";
		const endTimer = this.processingDuration.startTimer({ event });

		try {
			await this.notificationsService.sendOtp(data);

			this.eventsTotal.inc({ event, status: "success" });

			this.rmqService.ack(ctx, event);
		} catch (error) {
			this.eventsTotal.inc({ event, status: "error" });

			await this.rmqService.retryOrDrop(ctx, event, error);
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
		const endTimer = this.processingDuration.startTimer({ event });

		try {
			await this.notificationsService.sendEmailChange(data);

			this.eventsTotal.inc({ event, status: "success" });

			this.rmqService.ack(ctx, event);
		} catch (error) {
			this.eventsTotal.inc({ event, status: "error" });

			await this.rmqService.retryOrDrop(ctx, event, error);
		} finally {
			endTimer();
		}
	}

	@EventPattern("account.phone.changed")
	public async phoneChanged(
		@Payload() data: PhoneChangedEvent,
		@Ctx() ctx: RmqContext,
	) {
		const event = "account.phone.changed";
		const endTimer = this.processingDuration.startTimer({ event });

		try {
			await this.notificationsService.sendPhoneChange(data);

			this.eventsTotal.inc({ event, status: "success" });

			this.rmqService.ack(ctx, event);
		} catch (error) {
			this.eventsTotal.inc({ event, status: "error" });

			await this.rmqService.retryOrDrop(ctx, event, error);
		} finally {
			endTimer();
		}
	}
}
