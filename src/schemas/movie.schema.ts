import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class Movie {
  @ApiProperty()
  @Prop({ required: true, unique: true })
  id: number;

  @ApiProperty()
  @Prop({ required: true })
  title: string;

  @ApiProperty()
  @Prop({ type: [Number] })
  genre_ids: number[];
}

export const MovieSchema = SchemaFactory.createForClass(Movie);