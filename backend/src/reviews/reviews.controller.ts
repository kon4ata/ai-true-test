import {
	Body,
	Controller,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Query,
} from '@nestjs/common';
import type { IAuthUser } from '../auth/auth.types.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { ReviewsQueryDto } from './dto/reviews-query.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';
import { ReviewsService } from './reviews.service.js';

@Controller('v1/reviews')
export class ReviewsController {
	constructor(private readonly reviews: ReviewsService) {}

	@Get()
	async list(
		@CurrentUser() user: IAuthUser,
		@Query() q: ReviewsQueryDto,
	) {
		return await this.reviews.list(user, q);
	}

	@Patch(':id/status')
	async updateStatus(
		@CurrentUser() user: IAuthUser,
		@Param('id', ParseUUIDPipe) id: string,
		@Body() dto: UpdateStatusDto,
	) {
		return await this.reviews.updateStatus(user, id, dto.status);
	}
}
