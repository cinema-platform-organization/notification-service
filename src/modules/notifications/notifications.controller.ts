import type {
	EmailChangedEvent,
	OtpRequestedEvent,
	PhoneChangedEvent,
} from "@cinema-platform/contracts";
import { Controller, Logger } from "@nestjs/common";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";

import { RmqService } from "@/infrastructure/rmq/rmq.service";

import { NotificationsService } from "./notifications.service";

@Controller()
export class NotificationsController {
	public constructor(
		private readonly logger: Logger,
		private readonly notificationsService: NotificationsService,
		private readonly rmqService: RmqService,
	) {}

	@EventPattern("auth.otp.requested")
	public async otpRequested(
		@Payload() data: OtpRequestedEvent,
		@Ctx() ctx: unknown,
	) {
		const context = ctx as RmqContext;

		try {
			await this.notificationsService.sendOtp(data);

			this.rmqService.ack(context);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : String(error);

			this.logger.error("OTP processing error: ", message);
			this.rmqService.nack(context);
		}
	}

	@EventPattern("account.email.changed")
	public async emailChanged(
		@Payload() data: EmailChangedEvent,
		@Ctx() ctx: RmqContext,
	) {
		try {
			await this.notificationsService.sendEmailChange(data);

			this.rmqService.ack(ctx);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : String(error);

			this.logger.error("Email change error: ", message);
			this.rmqService.nack(ctx);
		}
	}

	@EventPattern("account.phone.changed")
	public async phoneChanged(
		@Payload() data: PhoneChangedEvent,
		@Ctx() ctx: RmqContext,
	) {
		try {
			await this.notificationsService.sendPhoneChange(data);

			this.rmqService.ack(ctx);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : String(error);

			this.logger.error("Phone change error: ", message);
			this.rmqService.nack(ctx);
		}
	}
}
