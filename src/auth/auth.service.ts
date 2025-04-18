import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../schemas/user.schema";
import { SignInDto } from "./dto/SignIn.dto";
import { SignUpDto } from "./dto/SignUp.dto";
import * as argon2 from 'argon2';

@Injectable({})
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService
    ) { }
    
    async signup(signUpDto: SignUpDto) {
        try {
            // Check if user exists
            const existingUser = await this.userModel.findOne({ email: signUpDto.email });
            if (existingUser) {
                throw new ConflictException('Email already exists');
            }

            const hashedPassword = await argon2.hash(signUpDto.password);

            // Create new user
            const newUser = new this.userModel({
                email: signUpDto.email,
                password: hashedPassword
            });

            // Save user
            const savedUser = await newUser.save();

            // Return user without password
            const { password, ...result } = savedUser.toObject();
            return result;
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new UnauthorizedException('Failed to create user');
        }
    }

    async signin(signinDto: SignInDto) {
        const user = await this.userModel.findOne({ email: signinDto.email });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        
        const isPasswordValid = await argon2.verify(signinDto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { sub: user._id, email: user.email };
        const token = await this.jwtService.signAsync(payload);

        const { password, ...result } = user.toObject();
        return {
            ...result,
            access_token: token
        };
    }
}