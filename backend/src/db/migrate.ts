import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	connectionTimeoutMillis: 10000,
	max: 1,
});

const db = drizzle(pool);

async function main() {
	try {
		await migrate(db, { migrationsFolder: './drizzle' });
		console.log('Migrations complete.');
	} catch (e) {
		console.error('Migration failed:', e);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

main();
