import { HttpException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../schemas/user.schema";
import { CreateUserDto } from "./dto/CreatUser.dto";
import { UpdateUserDto } from "./dto/UpdateUser.dto";
import { UserFavorite } from "../schemas/UserFavorite.schema";

@Injectable({})
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>, 
        @InjectModel(UserFavorite.name) private userFavorateModel: Model<UserFavorite>
    ) { }
    
    async createUser(createUserDto: CreateUserDto) {
        const newUser = new this.userModel(createUserDto);
        return newUser.save(); 
    }
    async getUsers() {
        return this.userModel.find().exec();
    }

    async getUserById(id: string) {
        return this.userModel.findById(id).exec();
    }

    async updateUser(id: string, user: UpdateUserDto) {
        return this.userModel.findByIdAndUpdate(id, user, { new: true }).exec();
    }

    async addFavorite(id: string, movieId: number) {
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            return new HttpException("User not found", 404);
        } 
        
        const favorite = await this.userFavorateModel.findById(movieId);
        if (favorite) {
            return user;
        }
        const newFavorite = new this.userFavorateModel({
            movieId: movieId,
            userId: id, 
        });
        await newFavorite.save();
    }
}