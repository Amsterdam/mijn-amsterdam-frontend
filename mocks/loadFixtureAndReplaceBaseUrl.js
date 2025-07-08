import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { MOCK_API_BASE_URL } from './settings.js';

/** Load in a fixture and replace all occurences of '{{BFF_MOCK_API_BASE_URL}}' with Mocks localhost.
 *
 *  @param {string} jsonFilePath
 *  Path to fixture located in mocks/fixtures/ like for example 'somefixture.json'.
 *
 *  @returns {Object} A JSON object.
 */
export function loadFixtureAndReplaceBaseUrl(jsonFilePath) {
  let jsonFile = readFileSync(
    join(import.meta.dirname, 'fixtures', jsonFilePath),
    {
      encoding: 'utf8',
    }
  );
  jsonFile = jsonFile.replaceAll(
    '{{BFF_MOCK_API_BASE_URL}}',
    MOCK_API_BASE_URL
  );
  return JSON.parse(jsonFile);
}
