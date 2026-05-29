import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { readFile } from 'fs/promises';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'placeholder_cloud_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'placeholder_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'placeholder_api_secret',
});

function isCloudinaryConfigured(): boolean {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  return Boolean(
    name && name !== 'your_cloud_name' && name !== 'placeholder_cloud_name',
  );
}

export async function uploadImage(file: Express.Multer.File): Promise<{
  secure_url: string;
  public_id: string;
}> {
  const buffer = await Promise.resolve(
    file.buffer ?? (file.path ? readFile(file.path) : null),
  );

  if (!buffer) {
    throw new Error('Uploaded file buffer is unavailable.');
  }

  if (!isCloudinaryConfigured()) {
    const mimeType = file.mimetype || 'image/jpeg';
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    console.warn(
      'Cloudinary not configured, using inline data URI fallback for uploaded image.',
    );
    return {
      secure_url: dataUrl,
      public_id: `local_${Date.now()}`,
    };
  }

  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream((error, result) => {
      if (error) {
        return reject(error);
      }
      resolve({
        secure_url: result!.secure_url,
        public_id: result!.public_id,
      });
    });

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    stream.pipe(upload);
  });
}
