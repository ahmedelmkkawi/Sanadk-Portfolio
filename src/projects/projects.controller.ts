import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('featured') featured?: string,
    @Query('search') search?: string,
  ) {
    const isFeatured = featured === 'true' ? true : featured === 'false' ? false : undefined;
    return this.projectsService.findAll({ category, status, featured: isFeatured, search });
  }

  @Get('related/:slug')
  getRelated(@Param('slug') slug: string) {
    return this.projectsService.getRelated(slug);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.projectsService.findOne(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('uploadedImages', 10))
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    console.log('POST /projects called. body keys:', Object.keys(createProjectDto || {}));
    console.log('POST /projects files count:', files?.length || 0);
    const imageUrls: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const uploadResult = await this.cloudinaryService.uploadImage(file);
          imageUrls.push(uploadResult.secure_url);
        } catch (err) {
          console.error('Cloudinary upload failed for project image:', err);
          // continue without blocking the whole request
        }
      }
    }
    
    // Add uploaded image urls if present
    if (imageUrls.length > 0) {
      createProjectDto.images = [...(createProjectDto.images || []), ...imageUrls];
    }

    return this.projectsService.create(createProjectDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('uploadedImages', 10))
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    console.log(`PUT /projects/${id} called. body keys:`, Object.keys(updateProjectDto || {}));
    console.log(`PUT /projects/${id} files count:`, files?.length || 0);
    const imageUrls: string[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const uploadResult = await this.cloudinaryService.uploadImage(file);
          imageUrls.push(uploadResult.secure_url);
        } catch (err) {
          console.error('Cloudinary upload failed for project image (update):', err);
        }
      }
    }

    if (imageUrls.length > 0) {
      updateProjectDto.images = [...(updateProjectDto.images || []), ...imageUrls];
    }

    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
