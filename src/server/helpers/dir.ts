import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export function getDirname(importMetaUrl: string): string {
  const __filename = fileURLToPath(importMetaUrl);
  return dirname(__filename);
}

export function getFilename(importMetaUrl: string): string {
  return fileURLToPath(importMetaUrl);
}
