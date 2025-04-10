import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto{
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({example: 'user@example.com', description: 'The email of the user'})
    email: string;
    @IsNotEmpty()
    @IsString()
    @ApiProperty({example: '', description: 'hashed password'})
    password: string;
    @IsString()
    @ApiProperty({example: 'johnDoe', description: 'This is user name'})
    userName?: string;
}