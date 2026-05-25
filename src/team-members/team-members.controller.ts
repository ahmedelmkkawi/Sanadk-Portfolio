import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TeamMembersService } from './team-members.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('team-members')
export class TeamMembersController {
  constructor(
    private readonly teamMembersService: TeamMembersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  findAll() {
    return this.teamMembersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamMembersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('uploadedImage'))
  async create(
    @Body() createTeamMemberDto: CreateTeamMemberDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      try {
        const uploadResult = await this.cloudinaryService.uploadImage(file);
        createTeamMemberDto.image = uploadResult.secure_url;
      } catch (err) {
        console.error('Cloudinary upload failed for team member image:', err);
      }
    }
    return this.teamMembersService.create(createTeamMemberDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('uploadedImage'))
  async update(
    @Param('id') id: string,
    @Body() updateTeamMemberDto: UpdateTeamMemberDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      try {
        const uploadResult = await this.cloudinaryService.uploadImage(file);
        updateTeamMemberDto.image = uploadResult.secure_url;
      } catch (err) {
        console.error('Cloudinary upload failed for team member image (update):', err);
      }
    }
    return this.teamMembersService.update(id, updateTeamMemberDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.teamMembersService.remove(id);
  }
}
