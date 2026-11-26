import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { join } from 'node:path';
import { Pool } from 'pg';
import { getTestDbUrl } from './test-db.js';

async function main() {
	const url = getTestDbUrl();
	const parsed = new URL(url);
	const dbName = parsed.pathname.slice(1);

	parsed.pathname = '/postgres';
	const admin = new Pool({ connectionString: parsed.toString() });

	try {
		const { rowCount } = await admin.query(
			'SELECT 1 FROM pg_database WHERE datname = $1',
			[dbName],
		);

		if (!rowCount) await admin.query(`CREATE DATABASE "${dbName}"`);
	} finally {
		await admin.end();
	}

	const pool = new Pool({ connectionString: url });

	try {
		await migrate(drizzle({ client: pool }), {
			migrationsFolder: join(import.meta.dirname, '../drizzle'),
		});
	} finally {
		await pool.end();
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
