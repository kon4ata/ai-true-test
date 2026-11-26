import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Module({
	imports: [
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				secret: config.getOrThrow<string>('JWT_SECRET'),
				signOptions: {
					algorithm: 'HS256',
					expiresIn: Number(
						config.get('JWT_EXPIRES_IN_SECONDS') ?? 3600,
					),
				},
				verifyOptions: { algorithms: ['HS256'] },
			}),
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, {
		provide: APP_GUARD, useClass: JwtAuthGuard,
	}],
})
export class AuthModule {}
