import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { IAuthUser } from './auth.types.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { Public } from './decorators/public.decorator.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
	constructor(private readonly auth: AuthService) {}

	@Public()
	@Post('login')
	@HttpCode(200)
	async login(@Body() dto: LoginDto) {
		return await this.auth.login(dto.email, dto.password);
	}

	@Get('me')
	me(@CurrentUser() user: IAuthUser) {
		return user;
	}
}
