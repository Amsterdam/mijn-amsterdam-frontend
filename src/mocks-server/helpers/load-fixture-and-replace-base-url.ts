import fs from 'node:fs';
import path from 'node:path';

import { MOCK_API_BASE_URL } from '../settings.ts';

export function loadFixtureAndReplaceBaseUrl(jsonFilePath: string): unknown {
  const fixturePath = path.resolve('src/mocks-server/fixtures', jsonFilePath);
  const jsonFile = fs.readFileSync(fixturePath, { encoding: 'utf8' });
  const replaced = jsonFile.replaceAll(
    '{{BFF_MOCK_API_BASE_URL}}',
    MOCK_API_BASE_URL
  );

  return JSON.parse(replaced);
}
