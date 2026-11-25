export interface IAuthUser {
	id: string;
	email: string;
	role: 'admin' | 'client';
	companyId: string | null;
}
