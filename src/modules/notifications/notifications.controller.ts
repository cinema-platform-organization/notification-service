import type { OtpRequestedEvent } from "@cinema-platform/contracts";
import { Controller } from "@nestjs/common";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";

import { RmqService } from "@/infrastructure/rmq/rmq.service";

import { NotificationsService } from "./notifications.service";

@Controller()
export class NotificationsController {
	public constructor(
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

			console.log("OTP processing error: ", message);

			this.rmqService.nack(context);
		}
	}
}
