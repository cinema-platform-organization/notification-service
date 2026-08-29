import validationSchema from "./validation.schema";

export default function () {
	const parsed = validationSchema.safeParse(process.env);

	if (!parsed.success) {
		console.error("Invalid environment variables", parsed.error.format());
		process.exit(1);
	}

	const env = parsed.data;

	return {
		app: {
			nodeEnv: env.NODE_ENV,
		},
		rmq: {
			url: env.RMQ_URL,
			queue: env.RMQ_QUEUE,
		},
		smtp: {
			host: env.SMTP_HOST,
			port: env.SMTP_PORT,
			username: env.SMTP_USERNAME,
			password: env.SMTP_PASSWORD,
			fromAddress: env.SMTP_FROM_ADDRESS,
			secure: env.SMTP_SECURE,
		},
		vonage: {
			apiKey: env.VONAGE_API_KEY,
			apiSecret: env.VONAGE_API_SECRET,
			fromName: env.VONAGE_FROM_NAME,
		},
	};
}
