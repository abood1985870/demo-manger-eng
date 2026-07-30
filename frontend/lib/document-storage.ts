import { randomUUID } from 'crypto';
import { unlink, readFile, writeFile, mkdir } from 'fs/promises';
import { extname, join, relative, resolve } from 'path';

const PRIVATE_PREFIX = 'private:';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const contentTypes: Record<string, string> = {
  pdf: 'application/pdf', doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  csv: 'text/csv', txt: 'text/plain',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  dwg: 'application/acad', dxf: 'application/dxf',
  zip: 'application/zip',
};

export function privateUploadsDirectory() {
  const configuredPath = process.env.DOCUMENT_STORAGE_PATH?.trim();
  return configuredPath
    ? resolve(/*turbopackIgnore: true*/ configuredPath)
    : join(/*turbopackIgnore: true*/ process.cwd(), 'storage', 'documents');
}

function resolveInside(root: string, value: string) {
  const filePath = resolve(/*turbopackIgnore: true*/ root, value.replace(/^[/\\]+/, ''));
  return relative(root, filePath).startsWith('..') ? null : filePath;
}

export function validateDocumentFile(file: File) {
  const extension = extname(file.name).slice(1).toLowerCase();
  const expectedType = contentTypes[extension];
  const hasCompatibleType = file.type === expectedType || file.type === 'application/octet-stream' || file.type === '';
  if (!expectedType || !hasCompatibleType) return 'Unsupported or unsafe project file type.';
  if (file.size === 0 || file.size > MAX_FILE_SIZE) return 'Document size must be between 1 byte and 10 MB.';
  return null;
}

export function sanitizeDocumentName(name: string) {
  const extension = extname(name).toLowerCase();
  const base = name.slice(0, Math.max(0, name.length - extension.length)).replace(/[^a-zA-Z0-9._ -]/g, '_').replace(/\s+/g, '_').slice(0, 120) || 'document';
  return `${base}${extension}`;
}

export async function storeDocument(tenantId: string, name: string, contents: Buffer) {
  const safeName = sanitizeDocumentName(name);
  const relativePath = join(/*turbopackIgnore: true*/ tenantId, `${randomUUID()}-${safeName}`);
  const root = privateUploadsDirectory();
  const filePath = resolveInside(root, relativePath);
  if (!filePath) throw new Error('Invalid storage path');
  await mkdir(/*turbopackIgnore: true*/ join(/*turbopackIgnore: true*/ root, tenantId), { recursive: true });
  await writeFile(/*turbopackIgnore: true*/ filePath, contents, { flag: 'wx' });
  return { storageKey: `${PRIVATE_PREFIX}${relativePath.replace(/\\/g, '/')}`, safeName };
}

function resolveStoredPath(storageKey: string) {
  if (storageKey.startsWith(PRIVATE_PREFIX)) return resolveInside(privateUploadsDirectory(), storageKey.slice(PRIVATE_PREFIX.length));
  // Existing public records remain readable only through authorized download routes.
  return resolveInside(resolve(/*turbopackIgnore: true*/ process.cwd(), 'public'), storageKey);
}

export async function readStoredDocument(storageKey: string) {
  const filePath = resolveStoredPath(storageKey);
  if (!filePath) throw new Error('Invalid document path');
  return readFile(/*turbopackIgnore: true*/ filePath);
}

export async function deleteStoredDocument(storageKey: string) {
  const filePath = resolveStoredPath(storageKey);
  if (!filePath) throw new Error('Invalid document path');
  await unlink(/*turbopackIgnore: true*/ filePath);
}

export function documentContentType(type: string, filename: string) {
  return contentTypes[type.toLowerCase()] || contentTypes[extname(filename).slice(1).toLowerCase()] || 'application/octet-stream';
}
