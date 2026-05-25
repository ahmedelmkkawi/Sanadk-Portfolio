import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true, unique: true })
  slug!: string;

  @Prop({ required: true })
  description!: string;

  @Prop([String])
  images!: string[];

  @Prop([String])
  technologies!: string[];

  @Prop({ required: true })
  category!: string;

  @Prop({ required: true, enum: ['draft', 'published'], default: 'draft' })
  status!: string;

  @Prop()
  liveUrl?: string;

  @Prop()
  githubUrl?: string;

  @Prop({ default: false })
  featured!: boolean;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'TeamMember' }] })
  teamMembers!: Types.ObjectId[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
