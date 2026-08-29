import { z } from "zod";

export enum Enviroment {
	Development = "development",
	Production = "production",
	Test = "test",
}

export default z.object({
	NODE_ENV: z.enum(Enviroment).default(Enviroment.Development),
	RMQ_URL: z.string().nonempty(),
	RMQ_QUEUE: z.string().nonempty(),
	SMTP_HOST: z.string().nonempty(),
	SMTP_PORT: z.coerce.number(),
	SMTP_USERNAME: z.string().nonempty(),
	SMTP_PASSWORD: z.string().nonempty(),
	SMTP_FROM_ADDRESS: z.string().email().nonempty(),
	SMTP_SECURE: z.string().transform(v => v === "true"),
	VONAGE_API_KEY: z.string().nonempty(),
	VONAGE_API_SECRET: z.string().nonempty(),
	VONAGE_FROM_NAME: z.string().nonempty(),
});
