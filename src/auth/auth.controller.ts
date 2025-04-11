import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/SignIn.dto';
import { SignUpDto } from './dto/SignUp.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async signup(@Body() signUpDto: SignUpDto) {
    return this.authService.signup(signUpDto);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: SignInDto })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async signin(@Body() signInDto: SignInDto) {
    return this.authService.signin(signInDto);
  }
}