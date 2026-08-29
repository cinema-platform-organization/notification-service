import { Inject, Injectable, Logger } from "@nestjs/common";
import { Auth } from "@vonage/auth";
import { Vonage } from "@vonage/server-sdk";

import { SMS_OPTIONS } from "./constants";
import type {
	SmsOptions,
	SmsSendResult,
	VonageSmsResponse,
} from "./interfaces";

@Injectable()
export class SmsService {
	private readonly logger = new Logger(SmsService.name);
	private readonly client: Vonage;
	private readonly fromName: string;

	public constructor(
		@Inject(SMS_OPTIONS) private readonly options: SmsOptions,
	) {
		this.client = new Vonage(
			new Auth({
				apiKey: this.options.apiKey,
				apiSecret: this.options.apiSecret,
			}),
		);
		this.fromName = this.options.fromName;
	}

	public async sendOtp(phone: string, code: string): Promise<void> {
		const result = await this.send(
			phone,
			`Your verification code is ${code}. It expires in 5 minutes.`,
		);

		if (!result.success) {
			throw new Error(result.error ?? "Failed to send OTP SMS");
		}
	}

	private async send(to: string, text: string): Promise<SmsSendResult> {
		try {
			const response = (await this.client.sms.send({
				to,
				from: this.fromName,
				text,
			})) as unknown as VonageSmsResponse;

			const failed = response.messages.find(m => Number(m.status) !== 0);

			if (failed) {
				const error = failed["error-text"] ?? "Unknown error";
				this.logger.error(`SMS failed for ${to}: ${error}`);

				return { success: false, error };
			}

			return { success: true };
		} catch (err) {
			const error = err instanceof Error ? err.message : "Unknown error";
			this.logger.error(`SMS send error for ${to}`, err);

			return { success: false, error };
		}
	}
}
