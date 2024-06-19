const fs = require('node:fs');
const settings = require('./settings.js');

/** Load in a JSON file and replace all occurences of '{{origin}}' with Mocks localhost */
function loadJSON(jsonFilePath) {
  const jsonFile = fs.readFileSync(jsonFilePath, { encoding: 'utf8' });

  return JSON.parse(jsonFile, (key, value) => {
    if (key === 'url') {
      return value.replace('{{origin}}', settings.MOCK_ORIGIN);
    }
    return value;
  });
}

module.exports = { loadJSON };
