import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DRIZZLE, PG_POOL } from './constants.js';
import * as schema from './schema/index.js';

export type Database = NodePgDatabase<typeof schema>;

@Global()
@Module({
	providers: [
		{
			provide: PG_POOL,
			inject: [ConfigService],
			useFactory: (config: ConfigService) =>
        		new Pool({ connectionString: config.getOrThrow<string>('DATABASE_URL') }),
		},
		{
			provide: DRIZZLE,
			inject: [PG_POOL],
			useFactory: (pool: Pool): Database => drizzle({
				client: pool,
				casing: 'snake_case',
				schema
			}),
		},
	],
	exports: [DRIZZLE],
})
export class DbModule implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async onApplicationShutdown() {
    await this.pool.end();
  }
}
