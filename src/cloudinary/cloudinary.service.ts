import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { readFile } from 'fs/promises';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'placeholder_cloud_name',
      api_key: process.env.CLOUDINARY_API_KEY || 'placeholder_api_key',
      api_secret: process.env.CLOUDINARY_API_SECRET || 'placeholder_api_secret',
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<any> {
    return new Promise((resolve, reject) => {
      const isCloudinaryConfigured =
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
        process.env.CLOUDINARY_CLOUD_NAME !== 'placeholder_cloud_name';

      if (!isCloudinaryConfigured) {
        Promise.resolve(file.buffer ?? (file.path ? readFile(file.path) : null))
          .then((buffer) => {
            if (!buffer) {
              return reject(new Error('Uploaded file buffer is unavailable.'));
            }

            const mimeType = file.mimetype || 'image/jpeg';
            const base64Data = buffer.toString('base64');
            const dataUrl = `data:${mimeType};base64,${base64Data}`;

            console.warn('⚠️ Cloudinary not configured, using inline data URI fallback for uploaded image.');
            resolve({
              secure_url: dataUrl,
              public_id: `local_${Date.now()}`,
            });
          })
          .catch(reject);

        return;
      }

      const upload = cloudinary.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result);
      });

      Promise.resolve(file.buffer ?? (file.path ? readFile(file.path) : null))
        .then((buffer) => {
          if (!buffer) {
            return reject(new Error('Uploaded file buffer is unavailable.'));
          }

          const stream = new Readable();
          stream.push(buffer);
          stream.push(null);
          stream.pipe(upload);
        })
        .catch(reject);
    });
  }
}
