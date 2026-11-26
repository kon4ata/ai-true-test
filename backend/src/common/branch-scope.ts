import { ForbiddenException } from '@nestjs/common';
import { eq, SQL } from 'drizzle-orm';
import type { IAuthUser } from '../auth/auth.types.js';
import { branches } from '../db/schema/index.js';

// единый источник истины, где определяется какие филиалы видит пользователь
export function branchScope(
	user: IAuthUser,
	requestedCompanyId?: string,
): SQL | undefined {
	if (user.role === 'admin') {
		return requestedCompanyId
			? eq(branches.companyId, requestedCompanyId)
			: undefined;
	}

	if (!user.companyId
		|| (requestedCompanyId && requestedCompanyId !== user.companyId)
	) {
		throw new ForbiddenException();
	}

	return eq(branches.companyId, user.companyId);
}
