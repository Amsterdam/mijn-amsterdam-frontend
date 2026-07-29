import { describe, expect, test } from 'vitest';

import { fetchErfpachtDossiersDetail } from './erfpacht-dossiers.ts';
import ERFPACHT_DOSSIERINFO_DETAILS from '../../../mocks-server/fixtures/erfpacht/erfpacht-v2-dossierinfo-bsn.json' with { type: 'json' };
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';

describe('erfpacht-dossiers', () => {
  const authProfileAndToken: AuthProfileAndToken = getAuthProfileAndToken();

  test('fetchErfpacht: dossier detail', async () => {
    remoteApi
      .get('/erfpacht/vernise/api/dossierinfo/E.477.46')
      .reply(200, ERFPACHT_DOSSIERINFO_DETAILS);

    const responseContent = await fetchErfpachtDossiersDetail(
      authProfileAndToken,
      'E.477.46'
    );
    expect(responseContent).toMatchSnapshot();
  });
});
