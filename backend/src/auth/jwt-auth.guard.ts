import {
	CanActivate,
	ExecutionContext,
	Inject,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../db/constants.js';
import type { Database } from '../db/db.module.js';
import { users } from '../db/schema/index.js';
import { IS_PUBLIC } from './decorators/public.decorator.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly jwt: JwtService,
		@Inject(DRIZZLE) private readonly db: Database,
	) {}

	async canActivate(ctx: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
			ctx.getHandler(),
			ctx.getClass(),
		]);

		if (isPublic) return true;

		const req = ctx.switchToHttp().getRequest();
		const [scheme, token] = (req.headers.authorization ?? '').split(' ');

		if (scheme !== 'Bearer' || !token) throw new UnauthorizedException();

		let userId: string;

		try {
			const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
			userId = payload.sub;
		} catch {
			throw new UnauthorizedException();
		}

		// роль берём из БД, а не из токена
		const [user] = await this.db
			.select({
				id: users.id,
				email: users.email,
				role: users.role,
				companyId: users.companyId,
			})
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!user) throw new UnauthorizedException();

		req.user = user;

		return true;
	}
}
