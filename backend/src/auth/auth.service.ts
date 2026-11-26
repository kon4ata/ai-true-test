import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword } from '../common/password.js';
import { DRIZZLE } from '../db/constants.js';
import type { Database } from '../db/db.module.js';
import { users } from '../db/schema/index.js';

// хэш-заглушка для защиты от тайминг-атак
const PLUG_HASH = hashPassword('plug-hash');

@Injectable()
export class AuthService {
	constructor(
		@Inject(DRIZZLE) private readonly db: Database,
		private readonly jwt: JwtService,
	) {}

	async login(email: string, password: string) {
		const [user] = await this.db
			.select()
			.from(users)
			.where(eq(users.email, email.trim().toLowerCase()))
			.limit(1);

		const passwordOk = verifyPassword(password, user?.passwordHash ?? PLUG_HASH,);

		if (!user || !passwordOk) {
			throw new UnauthorizedException('Неверный email или пароль');
		}

		const accessToken = await this.jwt.signAsync({ sub: user.id });

		return {
			accessToken,
			user: {
				id: user.id,
				email: user.email,
				role: user.role,
				companyId: user.companyId,
			},
		};
	}
}
