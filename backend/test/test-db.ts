import 'dotenv/config';

export function getTestDbUrl(): string {
	const url = process.env.DATABASE_URL_TEST;

	if (!url) throw new Error('Не задана DATABASE_URL_TEST');

	const dbName = new URL(url).pathname.slice(1);

	if (!dbName.endsWith('_test')) {
		throw new Error(
			`Тесты стирают данные, имя базы должно заканчиваться на _test: ${dbName}`,
		);
	}

	return url;
}
