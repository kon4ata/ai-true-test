import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { hashPassword } from '../common/password.js';
import * as schema from './schema/index.js';

const DAYS = 60;
const { companies, users, branches, dailyStats, reviews, reviewStatus } = schema;

async function main() {
	const pool = new Pool({
		connectionString: process.env.DATABASE_URL,
	});
	const db = drizzle({
		client: pool,
		schema,
		casing: 'snake_case',
	});

	try {
		await db.transaction(async (tx) => {
			await tx.execute(
				sql`TRUNCATE TABLE reviews, daily_stats, branches, users, companies CASCADE`,
			);

			const [coffee, motor] = await tx
				.insert(companies)
				.values([
					{ name: 'Кофейня «Зерно»' },
					{ name: 'Автосервис «Мотор»' },
				])
				.returning();

			const branchRows = await tx
				.insert(branches)
				.values([
					{
						companyId: coffee.id,
						name: 'Зерно на Невском',
						city: 'Санкт-Петербург',
						address: 'Невский пр., 10',
					},
					{
						companyId: coffee.id,
						name: 'Зерно на Арбате',
						city: 'Москва',
						address: 'ул. Арбат, 5',
					},
					{
						companyId: motor.id,
						name: 'Мотор Север',
						city: 'Казань',
						address: 'ул. Северная, 21',
					},
					{
						companyId: motor.id,
						name: 'Мотор Юг',
						city: 'Краснодар',
						address: 'ул. Южная, 7',
					},
				])
				.returning();

			await tx.insert(users).values([
				{
					email: 'admin@example.com',
					passwordHash: hashPassword('admin123'),
					role: 'admin',
				},
				{
					email: 'client1@example.com',
					passwordHash: hashPassword('client123'),
					role: 'client',
					companyId: coffee.id,
				},
				{
					email: 'client2@example.com',
					passwordHash: hashPassword('client123'),
					role: 'client',
					companyId: motor.id,
				},
			]);

			const statRows: (typeof dailyStats.$inferInsert)[] = [];
			const reviewRows: (typeof reviews.$inferInsert)[] = [];

			branchRows.forEach((branch, b) => {
				for (let i = 0; i < DAYS; i++) {
					const d = new Date();
					d.setUTCDate(d.getUTCDate() - i);

					// отзыв раз в два дня, рейтинг и статус по кругу
					const hasReview = i % 2 === 0;
					const rating = ((i + b) % 5) + 1;

					if (hasReview) {
						reviewRows.push({
							branchId: branch.id,
							authorName: `Клиент ${i + 1}`,
							rating,
							text: `Тестовый отзыв, оценка ${rating}`,
							status: reviewStatus.enumValues[(i + b) % 3],
							publishedAt: d,
						});
					}

					statRows.push({
						branchId: branch.id,
						date: d.toISOString().slice(0, 10),
						views: 200 + b * 50 + (i % 7) * 20,
						websiteClicks: 20 + (i % 5) * 3,
						calls: 8 + (i % 4) * 2,
						routes: 12 + (i % 6) * 2,
						reviewsCount: hasReview ? 1 : 0,
						ratingSum: hasReview ? rating : 0,
					});
				}
			});

			await tx.insert(dailyStats).values(statRows);
			await tx.insert(reviews).values(reviewRows);

			console.log(`Seed OK: branches=${branchRows.length}, stats=${statRows.length}, reviews=${reviewRows.length}`);
		});
	} finally {
		await pool.end();
	}
};

main().catch((e) => {
	console.error('Seed failed, changes rolled back:', e);
	process.exit(1);
});
