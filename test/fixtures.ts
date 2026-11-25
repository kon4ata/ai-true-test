import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { hashPassword } from '../src/common/password.js';
import * as schema from '../src/db/schema/index.js';

export const PASSWORD = 'password123';

const { companies, users, branches, dailyStats, reviews } = schema;

// числа подобраны так, чтобы ожидаемые значения в тестах считались вручную
export async function seedFixtures() {
	const pool = new Pool({ connectionString: process.env.DATABASE_URL });
	const db = drizzle({ client: pool, schema, casing: 'snake_case' });

	try {
		return await db.transaction(async (tx) => {
			await tx.execute(
				sql`TRUNCATE TABLE reviews, daily_stats, branches, users, companies CASCADE`,
			);

			const [cx, cy] = await tx
				.insert(companies)
				.values([{ name: 'Company X' }, { name: 'Company Y' }])
				.returning();

			const [x1, x2, y1] = await tx
				.insert(branches)
				.values([
					{
						companyId: cx.id,
						name: 'X1',
						city: 'City',
						address: 'Addr 1',
					},
					{
						companyId: cx.id,
						name: 'X2',
						city: 'City',
						address: 'Addr 2',
					},
					{
						companyId: cy.id,
						name: 'Y1',
						city: 'City',
						address: 'Addr 3',
					},
				])
				.returning();

			const passwordHash = hashPassword(PASSWORD);

			await tx.insert(users).values([
				{ email: 'admin@test.local', passwordHash, role: 'admin' },
				{
					email: 'client-x@test.local',
					passwordHash,
					role: 'client',
					companyId: cx.id,
				},
				{
					email: 'client-y@test.local',
					passwordHash,
					role: 'client',
					companyId: cy.id,
				},
			]);

			await tx.insert(dailyStats).values([
				{
					branchId: x1.id,
					date: '2026-01-10',
					views: 100,
					websiteClicks: 10,
					calls: 5,
					routes: 7,
					reviewsCount: 3,
					ratingSum: 15,
				},
				{
					branchId: x1.id,
					date: '2026-01-11',
					views: 10,
					websiteClicks: 1,
					calls: 1,
					routes: 1,
					reviewsCount: 0,
					ratingSum: 0,
				},
				{
					branchId: x2.id,
					date: '2026-01-10',
					views: 50,
					websiteClicks: 5,
					calls: 2,
					routes: 3,
					reviewsCount: 1,
					ratingSum: 1,
				},
				{
					branchId: y1.id,
					date: '2026-01-10',
					views: 1000,
					websiteClicks: 100,
					calls: 50,
					routes: 70,
					reviewsCount: 2,
					ratingSum: 10,
				},
			]);

			const [rx1, rx2, rx3, ry1, ry2] = await tx
				.insert(reviews)
				.values([
					{
						branchId: x1.id,
						authorName: 'A',
						rating: 5,
						text: 't',
						status: 'new',
						publishedAt: new Date('2026-01-10T10:00:00Z'),
					},
					{
						branchId: x1.id,
						authorName: 'B',
						rating: 1,
						text: 't',
						status: 'processed',
						publishedAt: new Date('2026-01-10T11:00:00Z'),
					},
					{
						branchId: x2.id,
						authorName: 'C',
						rating: 3,
						text: 't',
						status: 'in_progress',
						publishedAt: new Date('2026-01-10T12:00:00Z'),
					},
					{
						branchId: y1.id,
						authorName: 'D',
						rating: 2,
						text: 't',
						status: 'new',
						publishedAt: new Date('2026-01-10T13:00:00Z'),
					},
					{
						branchId: y1.id,
						authorName: 'E',
						rating: 5,
						text: 't',
						status: 'new',
						publishedAt: new Date('2026-01-10T14:00:00Z'),
					},
				])
				.returning();

			return {
				companyX: cx.id,
				companyY: cy.id,
				branchX1: x1.id,
				branchX2: x2.id,
				branchY1: y1.id,
				reviewX1: rx1.id,
				reviewX2: rx2.id,
				reviewX3: rx3.id,
				reviewY1: ry1.id,
				reviewY2: ry2.id,
			};
		});
	} finally {
		await pool.end();
	}
}
