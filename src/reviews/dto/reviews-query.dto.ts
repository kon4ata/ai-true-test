import { Type } from 'class-transformer';
import {
	IsIn,
	IsInt,
	IsOptional,
	IsUUID,
	Matches,
	Max,
	Min,
} from 'class-validator';
import { DATE_RE } from '../../common/period.js';
import { reviewStatus } from '../../db/schema/index.js';

export class ReviewsQueryDto {
	@IsOptional()
	@IsUUID()
	companyId?: string;

	@IsOptional()
	@IsUUID()
	branchId?: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(5)
	rating?: number;

	@IsOptional()
	@IsIn(reviewStatus.enumValues)
	status?: (typeof reviewStatus.enumValues)[number];

	@IsOptional()
	@Matches(DATE_RE, { message: 'from: формат YYYY-MM-DD' })
	from?: string;

	@IsOptional()
	@Matches(DATE_RE, { message: 'to: формат YYYY-MM-DD' })
	to?: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number;
}
