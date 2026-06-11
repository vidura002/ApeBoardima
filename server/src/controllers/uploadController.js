import { uploadImage } from '../utils/cloudinary.js';

export async function uploadImages(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const uploads = await Promise.all(
      req.files.map(file => uploadImage(file.buffer, 'roomlanka/properties', { file, baseUrl }))
    );

    return res.json({
      urls: uploads.map(u => u.url),
      publicIds: uploads.map(u => u.publicId),
    });
  } catch (err) {
    console.error('uploadImages error:', err);
    return res.status(500).json({ error: 'Image upload failed. Please try again.' });
  }
}
