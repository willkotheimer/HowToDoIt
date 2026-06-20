/**
 * Downscales and re-encodes an image in the browser before upload.
 *
 * iPhone photos are typically 3–12 MB. Resizing to a sane max edge and
 * re-encoding to JPEG keeps phone uploads fast and storage small. Using
 * `createImageBitmap` with `imageOrientation: 'from-image'` also bakes in the
 * EXIF rotation so portrait photos don't come out sideways.
 */

const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.8;

export async function compressImage(
  file: File,
  maxEdge: number = MAX_EDGE,
  quality: number = JPEG_QUALITY,
): Promise<File> {
  // Only attempt to process raster images we can decode.
  if (!file.type.startsWith('image/')) {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    // Browser couldn't decode (e.g. HEIC on a desktop browser) — upload as-is.
    return file;
  }

  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', quality);
  });

  if (!blob) {
    return file;
  }

  const newName = file.name.replace(/\.[^.]+$/, '') || 'photo';
  return new File([blob], `${newName}.jpg`, { type: 'image/jpeg' });
}

export default compressImage;
