import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import type { IAuthUser } from '../auth/auth.types.js';
import { branchScope } from '../common/branch-scope.js';
import { DRIZZLE } from '../db/constants.js';
import type { Database } from '../db/db.module.js';
import { branches, companies } from '../db/schema/index.js';

const columns = {
	id: branches.id,
	companyId: branches.companyId,
	companyName: companies.name,
	name: branches.name,
	city: branches.city,
	address: branches.address,
};

@Injectable()
export class BranchesService {
	constructor(@Inject(DRIZZLE) private readonly db: Database) {}

	async getList(user: IAuthUser, companyId?: string) {
		return await this.db
			.select(columns)
			.from(branches)
			.innerJoin(companies, eq(companies.id, branches.companyId))
			.where(branchScope(user, companyId))
			.orderBy(branches.name);
	}

	async getOne(user: IAuthUser, id: string) {
		const [row] = await this.db
			.select(columns)
			.from(branches)
			.innerJoin(companies, eq(companies.id, branches.companyId))
			.where(and(eq(branches.id, id), branchScope(user)))
			.limit(1);

		if (!row) throw new NotFoundException('Филиал не найден');

		return row;
	}
}
