import { randomUUID } from 'crypto';
import { unlink, mkdir, readFile } from 'fs/promises';
import { resolve, join, relative } from 'path';
import sharp from 'sharp';

const PRIVATE_PREFIX = 'avatar:';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

function privateAvatarsDirectory() {
  // Keeping uploads under one statically scoped private folder prevents the
  // standalone production tracer from following arbitrary filesystem paths.
  return join(/*turbopackIgnore: true*/ process.cwd(), 'storage', 'avatars');
}

function resolveInside(root: string, value: string) {
  const filePath = resolve(/*turbopackIgnore: true*/ root, value.replace(/^[/\\]+/, ''));
  return relative(root, filePath).startsWith('..') ? null : filePath;
}

export function validateAvatarFile(file: File) {
  if (!allowedTypes.includes(file.type)) {
    return 'Only JPG, PNG, and WEBP files are allowed.';
  }
  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return 'Avatar size must be between 1 byte and 5 MB.';
  }
  return null;
}

export async function storeAvatar(tenantId: string, userId: string, contents: Buffer) {
  // Use sharp to process the image: convert to webp, resize to 512x512, compress
  const processedImageBuffer = await sharp(contents)
    .resize(512, 512, { fit: 'cover', position: 'center' })
    .webp({ quality: 80, effort: 4 })
    .toBuffer();

  const safeName = `${randomUUID()}.webp`;
  const relativePath = join(/*turbopackIgnore: true*/ tenantId, userId, safeName);
  const root = privateAvatarsDirectory();
  const filePath = resolveInside(root, relativePath);
  
  if (!filePath) throw new Error('Invalid storage path');
  
  await mkdir(/*turbopackIgnore: true*/ join(/*turbopackIgnore: true*/ root, tenantId, userId), { recursive: true });
  
  const fs = await import('fs/promises');
  await fs.writeFile(/*turbopackIgnore: true*/ filePath, processedImageBuffer, { flag: 'wx' });
  
  return { storageKey: `${PRIVATE_PREFIX}${relativePath.replace(/\\/g, '/')}` };
}

export function resolveAvatarPath(storageKey: string) {
  if (storageKey.startsWith(PRIVATE_PREFIX)) {
    return resolveInside(privateAvatarsDirectory(), storageKey.slice(PRIVATE_PREFIX.length));
  }
  return null;
}

export async function readStoredAvatar(storageKey: string) {
  const filePath = resolveAvatarPath(storageKey);
  if (!filePath) throw new Error('Invalid avatar path');
  return readFile(/*turbopackIgnore: true*/ filePath);
}

export async function deleteStoredAvatar(storageKey: string) {
  const filePath = resolveAvatarPath(storageKey);
  if (!filePath) throw new Error('Invalid avatar path');
  await unlink(/*turbopackIgnore: true*/ filePath).catch(() => {});
}
