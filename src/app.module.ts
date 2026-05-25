import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { Project, ProjectSchema } from './schemas/project.schema';
import { TeamMember, TeamMemberSchema } from './schemas/team-member.schema';
import { Admin, AdminSchema } from './schemas/admin.schema';

import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { TeamMembersModule } from './team-members/team-members.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/sanadak-portfolio'),
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: TeamMember.name, schema: TeamMemberSchema },
      { name: Admin.name, schema: AdminSchema },
    ]),
    AuthModule,
    ProjectsModule,
    TeamMembersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
