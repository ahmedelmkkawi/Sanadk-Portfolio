import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/admin.model';
import { HttpError } from '../utils/http-error';

const jwtSecret = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

export async function seedAdmin(): Promise<void> {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Admin.create({
        email: 'admin@sanadak.com',
        password: hashedPassword,
      });
      console.log('Seeded default admin: admin@sanadak.com / admin123');
    }
  } catch (error) {
    console.error('Admin seed skipped (database not ready):', error);
  }
}

export async function login(email: string, password: string) {
  if (!email || !password || password.length < 6) {
    throw new HttpError(400, 'Email and password (min 6 chars) are required');
  }

  const admin = await Admin.findOne({ email });
  if (!admin) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const payload = { email: admin.email, sub: admin._id.toString() };
  return {
    access_token: jwt.sign(payload, jwtSecret, { expiresIn: '7d' }),
    admin: {
      id: admin._id,
      email: admin.email,
    },
  };
}
