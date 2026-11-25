import { relations } from 'drizzle-orm';
import { branches, companies, dailyStats, reviews, users } from './tables.js';

export const companiesRelations = relations(companies, ({ many }) => ({
	branches: many(branches),
	users: many(users),
}));

export const usersRelations = relations(users, ({ one }) => ({
	company: one(companies, {
		fields: [users.companyId],
		references: [companies.id],
	}),
}));

export const branchesRelations = relations(branches, ({ one, many }) => ({
	company: one(companies, {
		fields: [branches.companyId],
		references: [companies.id],
	}),
	dailyStats: many(dailyStats),
	reviews: many(reviews),
}));

export const dailyStatsRelations = relations(dailyStats, ({ one }) => ({
	branch: one(branches, {
		fields: [dailyStats.branchId],
		references: [branches.id],
	}),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
	branch: one(branches, {
		fields: [reviews.branchId],
		references: [branches.id],
	}),
}));
