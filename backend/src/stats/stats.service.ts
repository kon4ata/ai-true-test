import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gte, lte, sql, type AnyColumn } from 'drizzle-orm';
import type { IAuthUser } from '../auth/auth.types.js';
import { BranchesService } from '../branches/branches.service.js';
import { branchScope } from '../common/branch-scope.js';
import { resolvePeriod } from '../common/period.js';
import { DRIZZLE } from '../db/constants.js';
import type { Database } from '../db/db.module.js';
import { branches, dailyStats } from '../db/schema/index.js';
import { StatsQueryDto } from './dto/stats-query.dto.js';

const total = (col: AnyColumn) =>
	sql<number>`coalesce(sum(${col}), 0)`.mapWith(Number);

const totals = {
	views: total(dailyStats.views),
	websiteClicks: total(dailyStats.websiteClicks),
	calls: total(dailyStats.calls),
	routes: total(dailyStats.routes),
	reviewsCount: total(dailyStats.reviewsCount),
	ratingSum: total(dailyStats.ratingSum),
};

type Totals = { [K in keyof typeof totals]: number };

// Взвешенный рейтинг: sum(rating_sum) / sum(reviews_count)
function toMetrics({ ratingSum, ...rest }: Totals) {
	return {
		...rest,
		avgRating:
			rest.reviewsCount > 0
				? Math.round((ratingSum / rest.reviewsCount) * 100) / 100
				: null,
	};
}

@Injectable()
export class StatsService {
	constructor(
		@Inject(DRIZZLE) private readonly db: Database,
		private readonly branchesService: BranchesService,
	) {}

	private async buildWhere(user: IAuthUser, q: StatsQueryDto) {
		const period = resolvePeriod(q.from, q.to);

		// если указан филиал, сначала проывреяем что он доступен пользователю (иначе 404)
		if (q.branchId) await this.branchesService.getOne(user, q.branchId);

		const where = and(
			branchScope(user, q.companyId),
			q.branchId ? eq(branches.id, q.branchId) : undefined,
			gte(dailyStats.date, period.from),
			lte(dailyStats.date, period.to),
		);

		return { where, period };
	}

	async summary(user: IAuthUser, q: StatsQueryDto) {
		const { where, period } = await this.buildWhere(user, q);

		const [row] = await this.db
			.select(totals)
			.from(dailyStats)
			.innerJoin(branches, eq(branches.id, dailyStats.branchId))
			.where(where);

		return { period, ...toMetrics(row) };
	}

	async daily(user: IAuthUser, q: StatsQueryDto) {
		const { where, period } = await this.buildWhere(user, q);

		const rows = await this.db
			.select({ date: dailyStats.date, ...totals })
			.from(dailyStats)
			.innerJoin(branches, eq(branches.id, dailyStats.branchId))
			.where(where)
			.groupBy(dailyStats.date)
			.orderBy(dailyStats.date);

		return {
			period,
			points: rows.map(({ date, ...t }) => ({ date, ...toMetrics(t) })),
		};
	}

	async byBranch(user: IAuthUser, q: StatsQueryDto) {
		const { where, period } = await this.buildWhere(user, q);

		const rows = await this.db
			.select({
				branchId: branches.id,
				branchName: branches.name,
				...totals,
			})
			.from(dailyStats)
			.innerJoin(branches, eq(branches.id, dailyStats.branchId))
			.where(where)
			.groupBy(branches.id, branches.name)
			.orderBy(branches.name);

		return {
			period,
			branches: rows.map(({ branchId, branchName, ...t }) => ({
				branchId,
				branchName,
				...toMetrics(t),
			})),
		};
	}
}
