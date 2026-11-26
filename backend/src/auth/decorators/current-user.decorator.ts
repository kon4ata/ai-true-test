import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { IAuthUser } from '../auth.types.js';

export const CurrentUser = createParamDecorator(
	(_: unknown, ctx: ExecutionContext): IAuthUser => ctx.switchToHttp().getRequest().user,
);
