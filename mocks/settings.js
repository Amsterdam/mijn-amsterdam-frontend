import fs from 'node:fs';
import path from 'node:path';

import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

// Mocks server will do some path magic and will prepend process.pwd() to the following.
export const MOCK_DOCUMENT_PATH = 'mocks/fixtures/documents/document.pdf';

export const MOCK_DOCUMENT_B64 = fs.readFileSync(
  path.resolve(MOCK_DOCUMENT_PATH),
  {
    encoding: 'base64',
  }
);

const ENV_CONFIG = loadEnv();
export const MOCK_BASE_PATH = getMockBasePath(ENV_CONFIG);
export const MOCK_ORIGIN = getMockOrigin(ENV_CONFIG);
export const MOCK_API_BASE_URL = MOCK_ORIGIN + MOCK_BASE_PATH;

function loadEnv() {
  const ENV_FILE = '.env.local';
  console.debug(`[mocks server] trying env file ${ENV_FILE}`);
  const envConfig = dotenv.config({ path: ENV_FILE });

  if (envConfig.error) {
    throw new Error(envConfig.error);
  }

  dotenvExpand.expand(envConfig);

  return envConfig.parsed;
}

function getMockBasePath(env_config) {
  const basepath = env_config.BFF_MOCK_API_BASE_PATH;

  if (!basepath) {
    throw new Error('BFF_MOCK_API_BASE_PATH not found in env_config');
  }

  if (basepath.startsWith('/')) {
    throw new Error(
      `Unexpected forward slash at the beggining of basepath: '${basepath}'`
    );
  }

  if (basepath.endsWith('/')) {
    throw new Error(`basepath: '${basepath}' may not end with a slash`);
  }

  // Mocks Server expects paths to begin with a forward slash
  return '/' + env_config.BFF_MOCK_API_BASE_PATH;
}

function getMockOrigin(env_config) {
  const origin = env_config.BFF_MOCK_API_ORIGIN;

  if (!origin) {
    throw new Error('BFF_MOCK_API_ORIGIN is undefined');
  }

  return origin;
}
