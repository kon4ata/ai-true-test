import { BadRequestException } from '@nestjs/common';

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 1000 * 60 * 60 * 24; // 86_400_000
const MAX_DAYS = 366;

function isRealDate(s: string): boolean {
	const date = new Date(`${s}T00:00:00Z`);

	return !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === s;
}

export function resolvePeriod(from?: string, to?: string) {
	const end = to ?? new Date().toISOString().slice(0, 10);

	const start =
		from ??
		new Date(Date.parse(`${end}T00:00:00Z`) - 29 * DAY_MS)
			.toISOString()
			.slice(0, 10);

	if (!isRealDate(start) || !isRealDate(end)) {
		throw new BadRequestException('Некорректная дата');
	}

	if (start > end) {
		throw new BadRequestException('Дата начала позже даты окончания');
	}

	const days = (Date.parse(end) - Date.parse(start)) / DAY_MS + 1;

	if (days > MAX_DAYS) {
		throw new BadRequestException(
			`Период не должен превышать ${MAX_DAYS} дней`,
		);
	}

	return { from: start, to: end };
}
