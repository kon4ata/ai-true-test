import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, gte, inArray, lt, sql } from 'drizzle-orm';
import type { IAuthUser } from '../auth/auth.types.js';
import { BranchesService } from '../branches/branches.service.js';
import { branchScope } from '../common/branch-scope.js';
import { resolvePeriod } from '../common/period.js';
import { DRIZZLE } from '../db/constants.js';
import type { Database } from '../db/db.module.js';
import { branches, reviews } from '../db/schema/index.js';
import { ReviewsQueryDto } from './dto/reviews-query.dto.js';

const DAY_MS = 1000 * 60 * 60 * 24; // 86_400_000

const columns = {
	id: reviews.id,
	branchId: reviews.branchId,
	branchName: branches.name,
	authorName: reviews.authorName,
	rating: reviews.rating,
	text: reviews.text,
	status: reviews.status,
	publishedAt: reviews.publishedAt,
	updatedAt: reviews.updatedAt,
};

@Injectable()
export class ReviewsService {
	constructor(
		@Inject(DRIZZLE) private readonly db: Database,
		private readonly branchesService: BranchesService,
	) {}

	async list(user: IAuthUser, q: ReviewsQueryDto) {
		const page = q.page ?? 1;
		const limit = q.limit ?? 20;

		// период необязателен - если не задан ни from, ни to, показываем все отзывы
		const period = q.from || q.to ? resolvePeriod(q.from, q.to) : null;

		if (q.branchId) await this.branchesService.getOne(user, q.branchId);

		const where = and(
			branchScope(user, q.companyId),
			q.branchId ? eq(reviews.branchId, q.branchId) : undefined,
			q.rating ? eq(reviews.rating, q.rating) : undefined,
			q.status ? eq(reviews.status, q.status) : undefined,
			period
				? gte(reviews.publishedAt, new Date(`${period.from}T00:00:00Z`))
				: undefined,
			period
				? lt(
						reviews.publishedAt,
						new Date(Date.parse(`${period.to}T00:00:00Z`) + DAY_MS),
					)
				: undefined,
		);

		const [items, [{ total }]] = await Promise.all([
			this.db
				.select(columns)
				.from(reviews)
				.innerJoin(branches, eq(branches.id, reviews.branchId))
				.where(where)
				.orderBy(desc(reviews.publishedAt), desc(reviews.id))
				.limit(limit)
				.offset((page - 1) * limit),
			this.db
				.select({ total: sql<number>`count(*)`.mapWith(Number) })
				.from(reviews)
				.innerJoin(branches, eq(branches.id, reviews.branchId))
				.where(where),
		]);

		return { items, total, page, limit };
	}

	async updateStatus(
		user: IAuthUser,
		id: string,
		status: (typeof reviews.$inferSelect)['status'],
	) {
		// доступные филиалы определяет та же branchScope
		const allowed = this.db
			.select({ id: branches.id })
			.from(branches)
			.where(branchScope(user));

		const updated = await this.db
			.update(reviews)
			.set({ status, updatedAt: new Date() })
			.where(and(eq(reviews.id, id), inArray(reviews.branchId, allowed)))
			.returning({ id: reviews.id });

		if (updated.length === 0)
			throw new NotFoundException('Отзыв не найден');

		const [row] = await this.db
			.select(columns)
			.from(reviews)
			.innerJoin(branches, eq(branches.id, reviews.branchId))
			.where(eq(reviews.id, id))
			.limit(1);

		return row;
	}
}
