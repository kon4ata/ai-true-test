import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';

async function bootstrap() {
	const PORT = process.env.PORT ?? 3000;
	const app = await NestFactory.create(AppModule);

	app.enableShutdownHooks();
	configureApp(app);

	await app.listen(PORT);

	console.log(`Server is running on ${PORT} port`);
}

bootstrap().catch((error) => {
	console.error("Failed to start server", error);
	process.exit(1);
});

