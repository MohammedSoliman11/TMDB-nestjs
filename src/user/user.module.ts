import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserFavorite, UserFavoriteSchema } from '../schemas/UserFavorite.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: UserFavorite.name, schema: UserFavoriteSchema},
        ]),
    ],
    providers: [UserService],
    controllers: [UserController],
})
export class UserModule {

}
