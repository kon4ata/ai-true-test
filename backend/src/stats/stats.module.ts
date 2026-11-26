import { Module } from '@nestjs/common';
import { BranchesModule } from '../branches/branches.module.js';
import { StatsController } from './stats.controller.js';
import { StatsService } from './stats.service.js';

@Module({
	imports: [BranchesModule],
	controllers: [StatsController],
	providers: [StatsService],
})
export class StatsModule {}
