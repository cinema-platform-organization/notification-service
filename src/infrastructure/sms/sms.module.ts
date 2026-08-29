import { type DynamicModule, Global, Module } from "@nestjs/common";

import { SMS_OPTIONS } from "./constants";
import type { SmsAsyncOptions, SmsOptions } from "./interfaces";
import {
	createSmsAsyncOptionsProvider,
	createSmsOptionsProvider,
} from "./sms.providers";
import { SmsService } from "./sms.service";

@Global()
@Module({})
export class SmsModule {
	public static register(options: SmsOptions): DynamicModule {
		const optionsProvider = createSmsOptionsProvider(options);

		return {
			module: SmsModule,
			providers: [optionsProvider, SmsService],
			exports: [SmsService, SMS_OPTIONS],
		};
	}

	public static registerAsync(options: SmsAsyncOptions): DynamicModule {
		const optionsProvider = createSmsAsyncOptionsProvider(options);

		return {
			module: SmsModule,
			imports: options.imports ?? [],
			providers: [optionsProvider, SmsService],
			exports: [SmsService, SMS_OPTIONS],
		};
	}
}
