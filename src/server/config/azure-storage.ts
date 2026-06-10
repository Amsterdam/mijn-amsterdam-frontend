import { BlobServiceClient } from '@azure/storage-blob';

import { getFromEnv } from '../helpers/env.ts';

const connectionString = getFromEnv('STORAGE_CONNECTION_STRING');
if (connectionString) {
  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
}
