import type { Provider } from "@nestjs/common";

import { SMS_OPTIONS } from "./constants";
import type { SmsAsyncOptions, SmsOptions } from "./interfaces";

export function createSmsOptionsProvider(options: SmsOptions): Provider {
	return {
		provide: SMS_OPTIONS,
		useValue: Object.freeze({ ...options }),
	};
}

export function createSmsAsyncOptionsProvider(
	options: SmsAsyncOptions,
): Provider {
	return {
		provide: SMS_OPTIONS,
		useFactory: async (...args: any[]) => {
			const resolved = await options.useFactory(...args);

			if (!resolved || typeof resolved.apiKey !== "string") {
				throw new Error(
					'[SmsModule] "apiKey" is required and must be a string',
				);
			}

			if (typeof resolved.apiSecret !== "string") {
				throw new Error(
					'[SmsModule] "apiSecret" is required and must be a string',
				);
			}

			if (typeof resolved.fromName !== "string") {
				throw new Error(
					'[SmsModule] "fromName" is required and must be a string',
				);
			}

			return Object.freeze({ ...resolved });
		},
		inject: options.inject ?? [],
	};
}
