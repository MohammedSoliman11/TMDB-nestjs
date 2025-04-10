import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UpdateUserDto{
    @IsString()
    userName?: string;
}