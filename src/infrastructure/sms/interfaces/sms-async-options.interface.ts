import type { FactoryProvider, ModuleMetadata } from "@nestjs/common";

import type { SmsOptions } from "./sms-options.interface";

export interface SmsAsyncOptions extends Pick<ModuleMetadata, "imports"> {
	useFactory: (...args: any[]) => Promise<SmsOptions> | SmsOptions;
	inject?: FactoryProvider["inject"];
}
