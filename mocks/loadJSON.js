const fs = require('node:fs');
const settings = require('./settings.js');
const path = require('node:path');

/** Load in a JSON file and replace all occurences of '{{origin}}' with Mocks localhost */
function loadJSON(jsonFilePath) {
  let jsonFile = fs.readFileSync(jsonFilePath, { encoding: 'utf8' });
  jsonFile = jsonFile.replaceAll('{{origin}}', settings.MOCK_ORIGIN);
  return JSON.parse(jsonFile);
}

module.exports = { loadJSON };
