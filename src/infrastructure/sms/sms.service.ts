import { Inject, Injectable } from "@nestjs/common";
import { Auth } from "@vonage/auth";
import { Vonage } from "@vonage/server-sdk";

import { SMS_OPTIONS } from "./constants";
import type {
	SmsOptions,
	SmsSendRequest,
	VonageSmsResponse,
} from "./interfaces";

@Injectable()
export class SmsService {
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

	public async sendOtp(phone: string, code: string) {
		await this.send({
			to: phone,
			text: `Your verification code is ${code}. It expires in 5 minutes.`,
		});
	}

	public async sendPhoneChange(phone: string, code: string) {
		return this.send({
			to: phone,
			text: `Your phone number change confirmation code: ${code}`,
		});
	}

	private async send(data: SmsSendRequest): Promise<VonageSmsResponse> {
		const payload = {
			to: data.to,
			from: this.fromName,
			text: data.text,
		};

		const response = (await this.client.sms.send(
			payload,
		)) as unknown as VonageSmsResponse;

		const failed = response.messages.find(m => Number(m.status) !== 0);

		if (failed) {
			throw new Error(failed["error-text"] ?? "Unknown error");
		}

		return response;
	}
}
