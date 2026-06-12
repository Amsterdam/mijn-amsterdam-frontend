import assert from 'node:assert';

import type { ContainerClient } from '@azure/storage-blob';
import { BlobServiceClient } from '@azure/storage-blob';

const skipBlobStorage = process.env.BFF_SKIP_APPCONFIG === 'true';

let _blobServiceClient: BlobServiceClient | undefined;

export function startBlobStorage() {
  if (skipBlobStorage) {
    return;
  }

  if (_blobServiceClient) {
    throw Error(
      'A BlobServiceClient is already initialized, there is no need to initialize it twice.'
    );
  }

  const connectionString = process.env.APP_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    return;
  }

  _blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
}

export function blobServiceClient(): BlobServiceClient {
  assert(
    _blobServiceClient,
    'Call startBlobStorage before calling this function to initialize the _blobServiceClient'
  );
  return _blobServiceClient;
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
