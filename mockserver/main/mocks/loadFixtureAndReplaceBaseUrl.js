const fs = require('node:fs');
const settings = require('./settings.js');
const path = require('node:path');

/** Load in a fixture and replace all occurences of '{{BFF_MOCK_API_BASE_URL}}' with Mocks localhost.
 *
 *  @param {string} jsonFilePath
 *  Path to fixture located in mocks/fixtures/ like for example 'somefixture.json'.
 *
 *  @returns {Object} A JSON object.
 */
function loadFixtureAndReplaceBaseUrl(jsonFilePath) {
  let jsonFile = fs.readFileSync(
    path.join(__dirname, 'fixtures', jsonFilePath),
    {
      encoding: 'utf8',
    }
  );
  jsonFile = jsonFile.replaceAll(
    '{{BFF_MOCK_API_BASE_URL}}',
    settings.MOCK_API_BASE_URL
  );
  return JSON.parse(jsonFile);
}

module.exports = loadFixtureAndReplaceBaseUrl;
