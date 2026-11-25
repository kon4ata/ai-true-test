import { IsIn } from 'class-validator';
import { reviewStatus } from '../../db/schema/index.js';

export class UpdateStatusDto {
	@IsIn(reviewStatus.enumValues)
	status: (typeof reviewStatus.enumValues)[number];
}
