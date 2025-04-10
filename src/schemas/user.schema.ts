import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class User {
    @ApiProperty({ example:'67f72a0c77e6ac10fa0bac4e', description: 'The user ID' })
    @Prop({ type: Types.ObjectId, auto: true })
    id: Types.ObjectId;

    @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
    @Prop({required: true, unique: true})
    email: string;

    @ApiProperty({ description: 'The hashed password of the user' })
    @Prop({required: true})
    password: string; 
}

export const UserSchema = SchemaFactory.createForClass(User);
