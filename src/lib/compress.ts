/**
 * Client-side image compression using the Canvas API.
 * Resizes and re-encodes the image before upload.
 *
 * - JPEG / WEBP → re-encoded as JPEG
 * - PNG          → re-encoded as PNG (preserves transparency)
 * - GIF          → returned as-is (animation would break)
 * - Already small enough → returned as-is
 */
export async function compressImage(
  file: File,
  maxSizeMB = 2,       // target: ≤ 2 MB (keeps quality high enough for web)
  maxWidth = 2560,
  maxHeight = 2560,
): Promise<File> {
  if (file.type === 'image/gif') return file;
  if (file.size <= maxSizeMB * 1024 * 1024) return file;

  const isPng = file.type === 'image/png';
  const outputType = isPng ? 'image/png' : 'image/jpeg';
  const ext = isPng ? '.png' : '.jpg';

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas context unavailable')); return; }

      if (!isPng) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(img, 0, 0, width, height);

      const maxBytes = maxSizeMB * 1024 * 1024;

      // For JPEG: lower quality step-by-step down to 0.65 minimum (no visible artifacts)
      const tryCompress = (quality: number) => {
        canvas.toBlob(blob => {
          if (!blob) { reject(new Error('Compression failed')); return; }

          if (!isPng && blob.size > maxBytes && quality > 0.65) {
            tryCompress(Math.max(quality - 0.05, 0.65));
            return;
          }

          const baseName = file.name.replace(/\.[^.]+$/, '');
          resolve(new File([blob], baseName + ext, {
            type: outputType,
            lastModified: Date.now(),
          }));
        }, outputType, isPng ? undefined : quality);
      };

      tryCompress(0.9); // start at 90% quality
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image load failed'));
    };

    img.src = objectUrl;
  });
}
