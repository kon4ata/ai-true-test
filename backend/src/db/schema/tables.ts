import { sql } from 'drizzle-orm';
import {
	check,
	date,
	index,
	integer,
	pgEnum,
	pgTable,
	smallint,
	text,
	timestamp,
	unique,
	uuid,
} from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', ['admin', 'client']);
export const reviewStatus = pgEnum('review_status', [
	'new',
	'in_progress',
	'processed',
]);

export const companies = pgTable('companies', {
	id: uuid().primaryKey().defaultRandom(),
	name: text().notNull(),
	createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable(
	'users',
	{
		id: uuid().primaryKey().defaultRandom(),
		email: text().notNull().unique(),
		passwordHash: text().notNull(),
		role: userRole().notNull(),
		// у клиента компания обязательна, у администратора её нет
		companyId: uuid().references(() => companies.id, {
			onDelete: 'cascade',
		}),
		createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		index('users_company_idx').on(t.companyId),
		check(
			'users_role_company_chk',
			sql`(${t.role} = 'admin' AND ${t.companyId} IS NULL) OR (${t.role} = 'client' AND ${t.companyId} IS NOT NULL)`,
		),
	],
);

export const branches = pgTable(
	'branches',
	{
		id: uuid().primaryKey().defaultRandom(),
		companyId: uuid()
			.notNull()
			.references(() => companies.id, { onDelete: 'cascade' }),
		name: text().notNull(),
		city: text().notNull(),
		address: text().notNull(),
		createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [index('branches_company_idx').on(t.companyId)],
);

export const dailyStats = pgTable(
	'daily_stats',
	{
		id: uuid().primaryKey().defaultRandom(),
		branchId: uuid()
			.notNull()
			.references(() => branches.id, { onDelete: 'cascade' }),
		date: date({ mode: 'string' }).notNull(),
		views: integer().notNull().default(0),
		websiteClicks: integer().notNull().default(0),
		calls: integer().notNull().default(0),
		routes: integer().notNull().default(0),
		// для взвешенного среднего рейтинга: sum(rating_sum) / sum(reviews_count)
		reviewsCount: integer().notNull().default(0),
		ratingSum: integer().notNull().default(0),
		createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		unique('daily_stats_branch_date_uq').on(t.branchId, t.date),
		check(
			'daily_stats_non_negative_chk',
			sql`${t.views} >= 0 AND ${t.websiteClicks} >= 0 AND ${t.calls} >= 0 AND ${t.routes} >= 0 AND ${t.reviewsCount} >= 0 AND ${t.ratingSum} >= 0`,
		),
	],
);

export const reviews = pgTable(
	'reviews',
	{
		id: uuid().primaryKey().defaultRandom(),
		branchId: uuid()
			.notNull()
			.references(() => branches.id, { onDelete: 'cascade' }),
		authorName: text().notNull(),
		rating: smallint().notNull(),
		text: text().notNull(),
		status: reviewStatus().notNull().default('new'),
		publishedAt: timestamp({ withTimezone: true }).notNull(),
		updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	},
	(t) => [
		check('reviews_rating_chk', sql`${t.rating} BETWEEN 1 AND 5`),
		index('reviews_branch_status_idx').on(t.branchId, t.status),
		index('reviews_branch_rating_idx').on(t.branchId, t.rating),
		index('reviews_branch_published_idx').on(t.branchId, t.publishedAt),
	],
);
