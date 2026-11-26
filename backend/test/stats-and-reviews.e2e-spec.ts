import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { seedFixtures } from './fixtures.js';
import { bearer, createTestApp, login } from './helpers.js';

describe('Статистика и отзывы', () => {
	let app: INestApplication;
	let ids: Awaited<ReturnType<typeof seedFixtures>>;
	let tokenX: string;

	const get = (url: string) => request(app.getHttpServer()).get(url).set(bearer(tokenX));
	const period = 'from=2026-01-01&to=2026-01-31';

	beforeAll(async () => {
		ids = await seedFixtures();
		app = await createTestApp();
		tokenX = await login(app, 'client-x@test.local');
	});

	afterAll(() => app.close());

	describe('статистика', () => {
		it('возвращает шесть показателей', async () => {
			const res = await get(`/api/v1/stats/summary?${period}`).expect(200);

			expect(res.body).toMatchObject({
				views: 160,
				websiteClicks: 16,
				calls: 8,
				routes: 11,
				reviewsCount: 4,
			});
		});

		it('средний рейтинг взвешенный, а не среднее средних', async () => {
			const res = await get(`/api/v1/stats/summary?${period}`).expect(200);

			expect(res.body.avgRating).toBe(4);
		});

		it('фильтр по филиалу сужает данные', async () => {
			const res = await get(
				`/api/v1/stats/summary?${period}&branchId=${ids.branchX2}`,
			).expect(200);

			expect(res.body).toMatchObject({
				views: 50,
				reviewsCount: 1,
				avgRating: 1,
			});
		});

		it('период без данных: нули и avgRating = null', async () => {
			const res = await get(
				'/api/v1/stats/summary?from=2025-01-01&to=2025-01-31',
			).expect(200);

			expect(res.body).toMatchObject({
				views: 0,
				reviewsCount: 0,
				avgRating: null,
			});
		});

		it('динамика по дням агрегирует филиалы', async () => {
			const res = await get(`/api/v1/stats/daily?${period}`).expect(200);

			expect(res.body.points.map((p: any) => [p.date, p.views])).toEqual([
				['2026-01-10', 150],
				['2026-01-11', 10],
			]);
		});

		it('некорректный период даёт 400', async () => {
			await get('/api/v1/stats/summary?from=2026-13-40').expect(400);
			await get('/api/v1/stats/summary?from=2026-02-01&to=2026-01-01').expect(400);
			await get('/api/v1/stats/summary?from=2020-01-01&to=2026-01-01').expect(400);
			await get('/api/v1/stats/summary?branchId=not-a-uuid').expect(400);
		});
	});

	describe('отзывы', () => {
		it('фильтр по рейтингу', async () => {
			const res = await get('/api/v1/reviews?rating=5').expect(200);

			expect(res.body.items.map((r: any) => r.id)).toEqual([
				ids.reviewX1,
			]);
		});

		it('фильтр по статусу', async () => {
			const res = await get('/api/v1/reviews?status=in_progress').expect(200);

			expect(res.body.items.map((r: any) => r.id)).toEqual([
				ids.reviewX3,
			]);
		});

		it('фильтры по рейтингу и статусу работают вместе', async () => {
			const hit = await get('/api/v1/reviews?rating=1&status=processed').expect(200);

			expect(hit.body.total).toBe(1);

			const miss = await get('/api/v1/reviews?rating=1&status=new').expect(200);

			expect(miss.body.total).toBe(0);
		});

		it('пагинация: total не зависит от limit, порядок от новых к старым', async () => {
			const page1 = await get('/api/v1/reviews?limit=2&page=1').expect(200);
			const page2 = await get('/api/v1/reviews?limit=2&page=2').expect(200);

			expect(page1.body.total).toBe(3);

			expect(page1.body.items.map((r: any) => r.id)).toEqual([
				ids.reviewX3,
				ids.reviewX2,
			]);

			expect(page2.body.items.map((r: any) => r.id)).toEqual([
				ids.reviewX1,
			]);
		});

		it('невалидные параметры дают 400', async () => {
			await get('/api/v1/reviews?rating=9').expect(400);
			await get('/api/v1/reviews?rating=abc').expect(400);
			await get('/api/v1/reviews?status=foo').expect(400);
			await get('/api/v1/reviews?limit=1000').expect(400);
		});

		it('смена статуса своего отзыва сохраняется', async () => {
			const res = await request(app.getHttpServer())
				.patch(`/api/v1/reviews/${ids.reviewX1}/status`)
				.set(bearer(tokenX))
				.send({ status: 'processed' })
				.expect(200);

			expect(res.body.status).toBe('processed');

			const list = await get('/api/v1/reviews?status=processed').expect(200);

			expect(list.body.items.map((r: any) => r.id)).toContain(
				ids.reviewX1,
			);
		});

		it('недопустимый статус в теле даёт 400', async () => {
			await request(app.getHttpServer())
				.patch(`/api/v1/reviews/${ids.reviewX1}/status`)
				.set(bearer(tokenX))
				.send({ status: 'deleted' })
				.expect(400);
		});
	});
});
