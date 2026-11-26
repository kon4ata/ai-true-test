import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PASSWORD, seedFixtures } from './fixtures.js';
import { bearer, createTestApp, login } from './helpers.js';

describe('Auth', () => {
	let app: INestApplication;
	let ids: Awaited<ReturnType<typeof seedFixtures>>;

	beforeAll(async () => {
		ids = await seedFixtures();
		app = await createTestApp();
	});
	afterAll(() => app.close());

	it('логин возвращает токен, роль и компанию из БД', async () => {
		const res = await request(app.getHttpServer())
			.post('/api/v1/auth/login')
			.send({ email: 'client-x@test.local', password: PASSWORD })
			.expect(200);

		expect(res.body.accessToken).toEqual(expect.any(String));
		expect(res.body.user).toMatchObject({
			role: 'client',
			companyId: ids.companyX,
		});

		expect(res.body.user).not.toHaveProperty('passwordHash');
	});

	it('неверный пароль и неизвестный email дают одинаковый 401', async () => {
		const wrongPassword = await request(app.getHttpServer())
			.post('/api/v1/auth/login')
			.send({ email: 'client-x@test.local', password: 'wrong' })
			.expect(401);

		const unknownEmail = await request(app.getHttpServer())
			.post('/api/v1/auth/login')
			.send({ email: 'nobody@test.local', password: 'wrong' })
			.expect(401);

		expect(unknownEmail.body.message).toBe(wrongPassword.body.message);
	});

	it('защищённые эндпоинты без токена отдают 401', async () => {
		for (const url of [
			'/api/v1/auth/me',
			'/api/v1/branches',
			'/api/v1/stats/summary',
			'/api/v1/reviews',
		]) {
			await request(app.getHttpServer()).get(url).expect(401);
		}
	});

	it('подделанный токен отклоняется', async () => {
		const token = await login(app, 'client-x@test.local');
		const [h, p, s] = token.split('.');
		const forged = `${h}.${p}.${s.slice(0, -2)}xx`;

		await request(app.getHttpServer())
			.get('/api/v1/auth/me')
			.set(bearer(forged))
			.expect(401);
	});
});
