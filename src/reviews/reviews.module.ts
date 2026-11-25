import { Module } from '@nestjs/common';
import { BranchesModule } from '../branches/branches.module.js';
import { ReviewsController } from './reviews.controller.js';
import { ReviewsService } from './reviews.service.js';

@Module({
	imports: [BranchesModule],
	controllers: [ReviewsController],
	providers: [ReviewsService],
})
export class ReviewsModule {}
