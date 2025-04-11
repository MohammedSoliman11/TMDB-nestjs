import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { SignInDto } from "./dto/SignIn.dto";
import { SignUpDto } from "./dto/SignUp.dto";

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('signin')
    @ApiOperation({ summary: 'Sign in with email and password' })
    @ApiResponse({ status: 200, description: 'User successfully signed in', type: SignInDto })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials' })
    signin(@Body() dto: SignInDto) {
        return this.authService.signin(dto);
    }

    @Post('signup')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User successfully created', type: SignUpDto })
    @ApiResponse({ status: 409, description: 'Conflict - Email already exists' })
    signup(@Body() dto: SignUpDto) {
        return this.authService.signup(dto);
    }
}