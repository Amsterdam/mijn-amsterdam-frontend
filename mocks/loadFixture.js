const fs = require('node:fs');
const settings = require('./settings.js');
const path = require('node:path');

/** Load in a fixture and replace all occurences of '{{origin}}' with Mocks localhost.
 *
 *  @param {string} jsonFilePath
 *  Path to fixture located in mocks/fixtures/ like for example 'somefixture.json'.
 *
 *  @returns {Object} A JSON object.
 */
function loadFixture(jsonFilePath) {
  let jsonFile = fs.readFileSync(
    path.join(__dirname, 'fixtures', jsonFilePath),
    {
      encoding: 'utf8',
    }
  );
  jsonFile = jsonFile.replaceAll('{{origin}}', settings.MOCK_ORIGIN);
  return JSON.parse(jsonFile);
}

module.exports = loadFixture;
