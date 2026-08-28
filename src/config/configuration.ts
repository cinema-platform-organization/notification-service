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
	};
}
