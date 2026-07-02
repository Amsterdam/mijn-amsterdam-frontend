import assert from 'node:assert';

import type { ContainerClient } from '@azure/storage-blob';
import { BlobServiceClient } from '@azure/storage-blob';

import { logger } from '../logging.ts';

let blobServiceClient: BlobServiceClient | undefined;

export function getBlobStorage(): BlobServiceClient | null {
  const connectionString = process.env.APP_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    return null;
  }

  if (blobServiceClient) {
    return blobServiceClient;
  }

  try {
    blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
  } catch (err) {
    logger.error(err, 'Invalid Azure Storage connection string');
    return null;
  }
  return blobServiceClient;
}

/** You can get a containerClient from calling blobServiceClient.getContainerClient */
export async function downloadBlob(
  containerClient: ContainerClient,
  blobName: string
): Promise<string> {
  const blobClient = containerClient.getBlobClient(blobName);
  const response = await blobClient.download();
  const stream = response.readableStreamBody;

  assert(stream, `No readable stream returned for blob: ${blobName}`);

  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString('utf-8');
}
