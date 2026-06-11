import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, '../../uploads');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function hasCloudinaryConfig() {
  return [process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET]
    .every(value => value && value !== 'placeholder');
}

function extensionFor(file = {}) {
  const fromName = path.extname(file.originalname || '').toLowerCase();
  if (fromName) return fromName;

  const byMime = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  };

  return byMime[file.mimetype] || '.jpg';
}

async function uploadLocalImage(buffer, folder, options = {}) {
  const safeFolder = folder.replace(/^roomlanka\/?/, '').replace(/[^a-zA-Z0-9/_-]/g, '') || 'properties';
  const targetDir = path.join(uploadsDir, safeFolder);
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extensionFor(options.file)}`;

  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, filename), buffer);

  const publicPath = `/uploads/${safeFolder}/${filename}`;
  const baseUrl = options.baseUrl || '';

  return {
    url: `${baseUrl}${publicPath}`,
    publicId: `local:${safeFolder}/${filename}`,
  };
}

export async function uploadImage(buffer, folder = 'roomlanka', options = {}) {
  if (!hasCloudinaryConfig()) {
    return uploadLocalImage(buffer, folder, options);
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

export async function deleteImage(publicId) {
  if (publicId?.startsWith('local:')) {
    const relativePath = publicId.replace(/^local:/, '');
    return unlink(path.join(uploadsDir, relativePath)).catch(() => null);
  }

  return cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
