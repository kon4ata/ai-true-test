import type { Metrics, ReviewStatus } from "./types.ts";

export const DAY_MS = 1000 * 60 * 60 * 24; // 86_400_000;
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const METRICS: {
	key: keyof Metrics;
	label: string,
}[] = [
	{ key: "views", label: "Просмотры карточек" },
	{ key: "websiteClicks", label: "Переходы на сайт" },
	{ key: "calls", label: "Звонки" },
	{ key: "routes", label: "Маршруты" },
	{ key: "avgRating", label: "Средний рейтинг" },
	{ key: "reviewsCount", label: "Отзывы" },
];

export const REVIEW_STATUSES: { value: ReviewStatus; label: string }[] = [
	{ value: "new", label: "Новый" },
	{ value: "in_progress", label: "В работе" },
	{ value: "processed", label: "Обработан" },
];

export const REVIEW_PAGE_SIZE = 20;