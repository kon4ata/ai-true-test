import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { BranchesModule } from './branches/branches.module.js';
import { DbModule } from './db/db.module.js';
import { StatsModule } from './stats/stats.module.js';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		DbModule,
		AuthModule,
		BranchesModule,
		StatsModule,
	],
})
export class AppModule {}
