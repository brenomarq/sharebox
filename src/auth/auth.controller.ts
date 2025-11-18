import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body(ValidationPipe) dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Post('login')
  login() {}

  @Post('me')
  getMyUser() {}
}
