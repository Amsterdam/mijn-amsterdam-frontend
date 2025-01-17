const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

// Mocks server will do some path magic and will prepend process.pwd() to the following.
const MOCK_DOCUMENT_PATH = 'mocks/fixtures/documents/document.pdf';

const MOCK_DOCUMENT_B64 = fs.readFileSync(path.resolve(MOCK_DOCUMENT_PATH), {
  encoding: 'base64',
});

const ENV_CONFIG = loadEnv();
const MOCK_BASE_PATH = getMockBasePath(ENV_CONFIG);
const MOCK_ORIGIN = getMockOrigin(ENV_CONFIG);
const MOCK_API_BASE_URL = MOCK_ORIGIN + MOCK_BASE_PATH;

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

module.exports = {
  MOCK_DOCUMENT_PATH,
  MOCK_DOCUMENT_B64,
  MOCK_BASE_PATH,
  MOCK_ORIGIN,
  MOCK_API_BASE_URL,
};
