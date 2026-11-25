import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { IsOptional, IsUUID } from 'class-validator';
import type { IAuthUser } from '../auth/auth.types.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { BranchesService } from './branches.service.js';

class ListBranchesQuery {
	@IsOptional()
	@IsUUID()
	companyId?: string;
}

@Controller('v1/branches')
export class BranchesController {
	constructor(private readonly branches: BranchesService) {}

	@Get()
	async getList(
		@CurrentUser() user: IAuthUser,
		@Query() q: ListBranchesQuery,
	) {
		return await this.branches.getList(user, q.companyId);
	}

	@Get(':id')
	async getOne(
		@CurrentUser() user: IAuthUser,
		@Param('id', ParseUUIDPipe) id: string,
	) {
		return await this.branches.getOne(user, id);
	}
}
