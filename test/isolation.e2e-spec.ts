import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { seedFixtures } from './fixtures.js';
import { bearer, createTestApp, login } from './helpers.js';

describe('Изоляция данных между компаниями', () => {
	let app: INestApplication;
	let ids: Awaited<ReturnType<typeof seedFixtures>>;
	let tokenX: string;
	let tokenY: string;
	let tokenAdmin: string;

	const get = (url: string, token: string) =>
		request(app.getHttpServer()).get(url).set(bearer(token));

	beforeAll(async () => {
		ids = await seedFixtures();
		app = await createTestApp();
		tokenX = await login(app, 'client-x@test.local');
		tokenY = await login(app, 'client-y@test.local');
		tokenAdmin = await login(app, 'admin@test.local');
	});
	afterAll(() => app.close());

	describe('филиалы', () => {
		it('клиент видит в списке только филиалы своей компании', async () => {
			const res = await get('/api/v1/branches', tokenX).expect(200);

			expect(res.body.map((b: any) => b.id).sort()).toEqual(
				[ids.branchX1, ids.branchX2].sort(),
			);
		});

		it('чужой филиал по прямому ID даёт 404 (в обе стороны)', async () => {
			await get(`/api/v1/branches/${ids.branchY1}`, tokenX).expect(404);
			await get(`/api/v1/branches/${ids.branchX1}`, tokenY).expect(404);
		});

		it('чужая компания в query даёт 403', async () => {
			await get(`/api/v1/branches?companyId=${ids.companyY}`, tokenX).expect(403);
		});
	});

	describe('статистика', () => {
		const period = 'from=2026-01-01&to=2026-01-31';

		it('сводка клиента не включает данные чужой компании', async () => {
			const res = await get(`/api/v1/stats/summary?${period}`, tokenX).expect(200);

			expect(res.body.views).toBe(160);
		});

		it('чужой филиал в фильтре статистики даёт 404 для всех трёх эндпоинтов', async () => {
			for (const path of ['summary', 'daily', 'by-branch']) {
				await get(
					`/api/v1/stats/${path}?${period}&branchId=${ids.branchY1}`,
					tokenX,
				).expect(404);
			}
		});

		it('чужая компания в фильтре статистики даёт 403', async () => {
			await get(
				`/api/v1/stats/summary?${period}&companyId=${ids.companyY}`,
				tokenX,
			).expect(403);
		});

		it('разбивка по филиалам содержит только свои филиалы', async () => {
			const res = await get(`/api/v1/stats/by-branch?${period}`, tokenX).expect(200);

			expect(
				res.body.branches.map((b: any) => b.branchId).sort(),
			).toEqual([ids.branchX1, ids.branchX2].sort());
		});
	});

	describe('отзывы', () => {
		it('список отзывов содержит только отзывы своей компании', async () => {
			const res = await get('/api/v1/reviews', tokenX).expect(200);

			expect(res.body.total).toBe(3);

			const reviewIds = res.body.items.map((r: any) => r.id);

			expect(reviewIds).not.toContain(ids.reviewY1);
			expect(reviewIds).not.toContain(ids.reviewY2);
		});

		it('отзывы чужого филиала в фильтре дают 404', async () => {
			await get(`/api/v1/reviews?branchId=${ids.branchY1}`, tokenX).expect(404);
		});

		it('чужой отзыв нельзя изменить: 404, статус в БД не изменился', async () => {
			await request(app.getHttpServer())
				.patch(`/api/v1/reviews/${ids.reviewY1}/status`)
				.set(bearer(tokenX))
				.send({ status: 'processed' })
				.expect(404);

			const res = await get(
				'/api/v1/reviews?companyId=' + ids.companyY,
				tokenAdmin,
			).expect(200);

			const review = res.body.items.find(
				(r: any) => r.id === ids.reviewY1,
			);

			expect(review.status).toBe('new');
		});

		it('несуществующий отзыв неотличим от чужого', async () => {
			const unknownId = '00000000-0000-4000-8000-000000000000';
			await request(app.getHttpServer())
				.patch(`/api/v1/reviews/${unknownId}/status`)
				.set(bearer(tokenX))
				.send({ status: 'processed' })
				.expect(404);
		});
	});

	describe('администратор', () => {
		it('видит все филиалы и суммарную статистику', async () => {
			const branches = await get('/api/v1/branches', tokenAdmin).expect(200);
			expect(branches.body).toHaveLength(3);

			const summary = await get(
				'/api/v1/stats/summary?from=2026-01-01&to=2026-01-31',
				tokenAdmin,
			).expect(200);

			expect(summary.body.views).toBe(1160);
		});

		it('может сузить выборку до одной компании', async () => {
			const res = await get(
				`/api/v1/branches?companyId=${ids.companyY}`,
				tokenAdmin,
			).expect(200);
			expect(res.body.map((b: any) => b.id)).toEqual([ids.branchY1]);
		});
	});
});
