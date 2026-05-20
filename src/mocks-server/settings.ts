import fs from 'node:fs';
import path from 'node:path';

import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

function loadEnv(): Record<string, string> {
  const envFile = '.env.local';
  const envConfig = dotenv.config({ path: envFile });

  if (envConfig.error) {
    throw new Error(String(envConfig.error));
  }

  dotenvExpand.expand(envConfig);

  return envConfig.parsed ?? {};
}

function getMockBasePath(envConfig: Record<string, string>): string {
  const basePath = envConfig.BFF_MOCK_API_BASE_PATH;

  if (!basePath) {
    throw new Error('BFF_MOCK_API_BASE_PATH not found in env_config');
  }

  if (basePath.startsWith('/')) {
    throw new Error(
      `Unexpected forward slash at the beginning of basepath: '${basePath}'`
    );
  }

  if (basePath.endsWith('/')) {
    throw new Error(`basepath: '${basePath}' may not end with a slash`);
  }

  return `/${basePath}`;
}

function getMockOrigin(envConfig: Record<string, string>): string {
  const origin = envConfig.BFF_MOCK_API_ORIGIN;

  if (!origin) {
    throw new Error('BFF_MOCK_API_ORIGIN is undefined');
  }

  return origin;
}

const envConfig = loadEnv();

// Kept pointing to existing fixture location during phased migration.
export const MOCK_DOCUMENT_PATH = path.resolve(
  'src/mocks-server/fixtures/documents/document.pdf'
);
export const MOCK_DOCUMENT_B64 = fs.readFileSync(MOCK_DOCUMENT_PATH, {
  encoding: 'base64',
});

export const MOCK_BASE_PATH = getMockBasePath(envConfig);
export const MOCK_ORIGIN = getMockOrigin(envConfig);
export const MOCK_API_BASE_URL = `${MOCK_ORIGIN}${MOCK_BASE_PATH}`;
export const MOCK_PORT = Number(new URL(MOCK_ORIGIN).port || 3100);
