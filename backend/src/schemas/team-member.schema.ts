import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type TeamMemberDocument = TeamMember & Document;

@Schema()
export class SocialLinks {
  @Prop()
  linkedin?: string;

  @Prop()
  github?: string;

  @Prop()
  twitter?: string;

  @Prop()
  portfolio?: string;
}

@Schema({ timestamps: true })
export class TeamMember {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  role!: string;

  @Prop()
  image?: string;

  @Prop()
  bio?: string;

  @Prop([String])
  skills!: string[];

  @Prop({ type: SocialLinks })
  socialLinks?: SocialLinks;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Project' }] })
  projects!: Types.ObjectId[];
}

export const TeamMemberSchema = SchemaFactory.createForClass(TeamMember);
