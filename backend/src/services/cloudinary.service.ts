import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { readFile } from 'fs/promises';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'placeholder_cloud_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'placeholder_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'placeholder_api_secret',
});

export function isCloudinaryConfigured(): boolean {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  return Boolean(
    name && name !== 'your_cloud_name' && name !== 'placeholder_cloud_name',
  );
}

export function logCloudinaryStatus(): void {
  if (isCloudinaryConfigured()) {
    console.log(`Cloudinary configured (cloud: ${process.env.CLOUDINARY_CLOUD_NAME})`);
    return;
  }
  console.warn(
    'Cloudinary NOT configured — set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET on Railway. Image uploads will use inline data URIs (not recommended for production).',
  );
}

export async function uploadImage(file: Express.Multer.File): Promise<{
  secure_url: string;
  public_id: string;
}> {
  const buffer = await Promise.resolve(
    file.buffer ?? (file.path ? readFile(file.path) : null),
  );

  if (!buffer?.length) {
    throw new Error('Uploaded file buffer is unavailable.');
  }

  if (!isCloudinaryConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET on Railway.',
      );
    }

    const mimeType = file.mimetype || 'image/jpeg';
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    console.warn('Cloudinary not configured — storing image as inline data URI.');
    return {
      secure_url: dataUrl,
      public_id: `local_${Date.now()}`,
    };
  }

  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: 'sanadak-portfolio',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result?.secure_url) {
          return reject(new Error('Cloudinary returned no secure_url.'));
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      },
    );

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    stream.pipe(upload);
  });
}
