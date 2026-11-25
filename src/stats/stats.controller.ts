import { Controller, Get, Query } from '@nestjs/common';
import type { IAuthUser } from '../auth/auth.types.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { StatsQueryDto } from './dto/stats-query.dto.js';
import { StatsService } from './stats.service.js';

@Controller('v1/stats')
export class StatsController {
	constructor(private readonly stats: StatsService) {}

	@Get('summary')
	async summary(
		@CurrentUser() user: IAuthUser,
		@Query() q: StatsQueryDto
	) {
		return await this.stats.summary(user, q);
	}

	@Get('daily')
	async daily(
		@CurrentUser() user: IAuthUser,
		@Query() q: StatsQueryDto
	) {
		return await this.stats.daily(user, q);
	}

	@Get('by-branch')
	async byBranch(
		@CurrentUser() user: IAuthUser,
		@Query() q: StatsQueryDto
	) {
		return await this.stats.byBranch(user, q);
	}
}
