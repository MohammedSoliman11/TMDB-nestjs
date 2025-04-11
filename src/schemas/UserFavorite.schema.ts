import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class UserFavorite {
    @Prop({ required: true })
    userId: string;
    @Prop({ required: true})
    movieId: string;
    @Prop({ default: Date.now})
    createdAt: Date;
}

export const UserFavoriteSchema = SchemaFactory.createForClass(UserFavorite);