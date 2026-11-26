import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { PASSWORD } from './fixtures.js';

export async function createTestApp(): Promise<INestApplication> {
	const moduleRef = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();

	const app = moduleRef.createNestApplication();

	configureApp(app);
	await app.init();

	return app;
}

export async function login(
	app: INestApplication,
	email: string,
): Promise<string> {
	const res = await request(app.getHttpServer())
		.post('/api/v1/auth/login')
		.send({ email, password: PASSWORD })
		.expect(200);

	return res.body.accessToken;
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });
