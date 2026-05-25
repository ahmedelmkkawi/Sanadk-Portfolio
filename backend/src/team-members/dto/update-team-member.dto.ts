import { IsString, IsArray, IsOptional, IsObject } from 'class-validator';
import { Transform } from 'class-transformer';
import { SocialLinksDto } from './create-team-member.dto';

export class UpdateTeamMemberDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map((t: string) => t.trim()).filter(Boolean);
      }
    }
    return value;
  })
  skills?: string[];

  @IsObject()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }
    return value;
  })
  socialLinks?: SocialLinksDto;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map((t: string) => t.trim()).filter(Boolean);
      }
    }
    return value;
  })
  projects?: string[];
}
