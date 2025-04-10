import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Movie{
    @Prop({ required: true, unique: true })
    tmdbId: number;
    @Prop({ required: true })
    title: string;
    @Prop({ required: true })
    genres: string[];
}

export const MoviceSchema = SchemaFactory.createForClass(Movie);