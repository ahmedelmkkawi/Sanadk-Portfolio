import { Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Admin, AdminDocument } from '../schemas/admin.schema';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private jwtService: JwtService,
  ) {}

  // Automatically seed an admin if none exists in the DB
  async onModuleInit() {
    const adminCount = await this.adminModel.countDocuments();
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.adminModel.create({
        email: 'admin@sanadak.com',
        password: hashedPassword,
      });
      console.log('🌱 Seeded default admin: admin@sanadak.com / admin123');
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const admin = await this.adminModel.findOne({ email });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { email: admin.email, sub: admin._id };
    return {
      access_token: this.jwtService.sign(payload),
      admin: {
        id: admin._id,
        email: admin.email,
      },
    };
  }

  async validateUser(email: string): Promise<any> {
    const admin = await this.adminModel.findOne({ email });
    if (admin) {
      const { password, ...result } = admin.toObject();
      return result;
    }
    return null;
  }
}
