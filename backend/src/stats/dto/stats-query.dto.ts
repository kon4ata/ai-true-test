import { IsOptional, IsUUID, Matches } from 'class-validator';
import { DATE_RE } from '../../common/period.js';

export class StatsQueryDto {
	@IsOptional()
	@IsUUID()
	companyId?: string;

	@IsOptional()
	@IsUUID()
	branchId?: string;

	@IsOptional()
	@Matches(DATE_RE, { message: 'from: формат YYYY-MM-DD' })
	from?: string;

	@IsOptional()
	@Matches(DATE_RE, { message: 'to: формат YYYY-MM-DD' })
	to?: string;
}
