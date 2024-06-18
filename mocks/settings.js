const fs = require('node:fs');
const path = require('node:path');

const MOCK_DOCUMENT_PATH = path.join(
  __dirname,
  path.resolve('/fixtures/documents/document.pdf')
);

const MOCK_DOCUMENT = fs.readFileSync(MOCK_DOCUMENT_PATH, {
  encoding: 'base64',
});

const DOCUMENT_IN_OBJECT = { inhoud: MOCK_DOCUMENT };

module.exports = { MOCK_DOCUMENT_PATH, DOCUMENT_IN_OBJECT };
