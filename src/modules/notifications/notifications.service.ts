import {
	EmailChangedEvent,
	OtpRequestedEvent,
	PhoneChangedEvent,
} from "@cinema-platform/contracts";
import { Injectable, Logger } from "@nestjs/common";

import { MailService } from "@/infrastructure/mail/mail.service";
import { SmsService } from "@/infrastructure/sms/sms.service";

@Injectable()
export class NotificationsService {
	private readonly logger = new Logger(NotificationsService.name);

	public constructor(
		private readonly mailService: MailService,
		private readonly smsService: SmsService,
	) {}

	public async sendOtp(data: OtpRequestedEvent) {
		const { identifier, code, type } = data;

		if (type === "email") {
			await this.mailService.sendOtp(identifier, code);
		} else {
			await this.smsService.sendOtp(identifier, code);
		}

		this.logger.log({ identifier, type }, "OTP sent");
	}

	public async sendPhoneChange(data: PhoneChangedEvent) {
		const { phone, code } = data;

		const result = await this.smsService.sendPhoneChange(phone, code);

		this.logger.log({ phone }, "Phone change code sent");

		return result;
	}

	public async sendEmailChange(data: EmailChangedEvent) {
		const { email, code } = data;

		const result = await this.mailService.sendEmailChange(email, code);

		this.logger.log({ email }, "Email change code sent");

		return result;
	}
}
