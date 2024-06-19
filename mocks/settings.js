const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

// Mocks server will do some path magic and will prepend process.pwd() to the following.
const MOCK_DOCUMENT_PATH = 'mocks/fixtures/documents/document.pdf';

const MOCK_DOCUMENT = fs.readFileSync(path.resolve(MOCK_DOCUMENT_PATH), {
  encoding: 'base64',
});

const DOCUMENT_IN_OBJECT = { inhoud: MOCK_DOCUMENT };

const ENV_CONFIG = loadEnv();

function loadEnv() {
  const ENV_FILE = '.env.local';
  console.debug(`trying env file ${ENV_FILE}`);
  const envConfig = dotenv.config({ path: ENV_FILE });

  if (envConfig.error) {
    throw new Error(envConfig.error);
  }

  dotenvExpand.expand(envConfig);
  return envConfig;
}

module.exports = { MOCK_DOCUMENT_PATH, DOCUMENT_IN_OBJECT, ENV_CONFIG };
