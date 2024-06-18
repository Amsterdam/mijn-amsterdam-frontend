const fs = require('node:fs');
const path = require('node:path');

// Mocks server will do some path magic and will prepend process.pwd() to the following.
const MOCK_DOCUMENT_PATH = 'mocks/fixtures/documents/document.pdf';

const MOCK_DOCUMENT = fs.readFileSync(path.resolve(MOCK_DOCUMENT_PATH), {
  encoding: 'base64',
});

const DOCUMENT_IN_OBJECT = { inhoud: MOCK_DOCUMENT };

module.exports = { MOCK_DOCUMENT_PATH, DOCUMENT_IN_OBJECT };
