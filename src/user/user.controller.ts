import { Body, Controller, Get, HttpException, Param, Patch, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/CreatUser.dto";
import mongoose from "mongoose";
import { UpdateUserDto } from "./dto/UpdateUser.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { User } from "../schemas/user.schema";

@Controller('users')
@ApiTags('users')
export class UserController {

    constructor(private userService: UserService) {}
    @Post()
    
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, description: 'The user has been successfully created.', type: User })
    createUser(@Body() createUserDto: CreateUserDto) {
        console.log(createUserDto);
        return this.userService.createUser(createUserDto);
    }
    @Get()
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'Return all users.', type: [User] })
    getUsers() {
        return this.userService.getUsers();
    }

    @Get(':id')
    @ApiResponse({ status: 200, description: 'Return the user.', type: User })
    @ApiResponse({ status: 404, description: 'User not found.' })
    async getUserById(@Param() param: any) {
        console.log(param);
        const isValid = mongoose.Types.ObjectId.isValid(param.id);
        if(!isValid){
            return new HttpException('invalid id', 400);
        }
        const user = await this.userService.getUserById(param.id);
        if(!user){
            return new HttpException('user not found', 404);
        }
        return user;
    }

    @Patch(':id')
    updateUser(@Param() param: any, @Body() updateUser: UpdateUserDto) {
        console.log(param);
        console.log(updateUser);
        return this.userService.updateUser(param.id, updateUser);
    }

    @Post(':id/favorites/:movieId')
    addFavorite(@Param() param: any) {
        console.log(param);
        return this.userService.addFavorite(param.id, param.movieId);
    }
}