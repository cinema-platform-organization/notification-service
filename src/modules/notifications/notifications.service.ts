import { OtpRequestedEvent } from "@cinema-platform/contracts";
import { Injectable } from "@nestjs/common";

import { MailService } from "@/infrastructure/mail/mail.service";

@Injectable()
export class NotificationsService {
	public constructor(private readonly mailService: MailService) {}

	public async sendOtp(data: OtpRequestedEvent) {
		const { identifier, code, type } = data;

		console.log(`OTP event received: `, data);

		if (type === "email") {
			await this.mailService.sendOtp(identifier, code);
		} else {
			console.log("SMS");
		}
	}
}
