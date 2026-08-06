import { describe, expect, test } from 'vitest';

import {
  fetchErfpachtDossierInfo,
  fetchErfpachtDossiersDetail,
  forTesting,
} from './erfpacht-dossiers.ts';
import type { ErfpachtDossiersDetailSource } from './erfpacht-types.ts';
import ERFPACHT_DOSSIERINFO_DETAILS from '../../../mocks-server/fixtures/erfpacht/erfpacht-v2-dossierinfo-bsn.json' with { type: 'json' };
import ERFPACHT_DOSSIERS from '../../../mocks-server/fixtures/erfpacht/erfpacht-v2-dossiers.json' with { type: 'json' };
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';

describe('erfpacht-dossiers', () => {
  const authProfileAndToken: AuthProfileAndToken = getAuthProfileAndToken();

  test('getDossierNummerUrlParam', () => {
    const { getDossierNummerUrlParam } = forTesting;

    expect(getDossierNummerUrlParam('E123/456')).toBe('E.123.456');
    expect(getDossierNummerUrlParam('EW/99999/88888')).toBe('EW.99999.88888');
    expect(getDossierNummerUrlParam('')).toBe('');
  });

  test('transformErfpachtDossierProperties: null', () => {
    const transformed = forTesting.transformErfpachtDossierProperties(null);
    expect(transformed).toBeNull();
  });

  test('transformErfpachtDossierProperties: dossier list item', () => {
    const dossierSource = ERFPACHT_DOSSIERS.dossiers?.dossiers?.[0] ?? null;
    const transformed =
      forTesting.transformErfpachtDossierProperties(dossierSource);

    expect(transformed?.id).toBe('A.B.C.D.2');
    expect(transformed?.title).toBe('E6470/243-2: Valutaboulevard 51');
    expect(transformed?.link).toEqual({
      title: 'E6470/243-2: Valutaboulevard 51',
      to: '/erfpacht/dossier/A.B.C.D.2',
    });
  });

  test('transformErfpachtDossierProperties: dossier detail formatting and filtering', () => {
    const transformed = forTesting.transformErfpachtDossierProperties(
      ERFPACHT_DOSSIERINFO_DETAILS as unknown as ErfpachtDossiersDetailSource
    );

    expect(
      transformed &&
        'juridisch' in transformed &&
        transformed?.juridisch?.ingangsdatum
    ).toBe('24 juni 2022');
    expect(
      transformed &&
        'eersteUitgifte' in transformed &&
        transformed?.eersteUitgifte
    ).toBe('01 januari 1922');
    expect(
      transformed && 'relaties' in transformed && transformed?.relaties
    ).toHaveLength(2);
    expect(
      transformed &&
        'relaties' in transformed &&
        transformed?.relaties?.every((r) => !r.indicatieGeheim)
    ).toBe(true);

    // Ensure source fixture was not mutated.
    expect(ERFPACHT_DOSSIERINFO_DETAILS.relaties).toHaveLength(3);
    expect(ERFPACHT_DOSSIERINFO_DETAILS.juridisch?.ingangsdatum).toBe(
      '2022-06-24'
    );
  });

  test('transformErfpachtDossierProperties: bijzondere bepalingen with zero area', () => {
    const source = {
      ...ERFPACHT_DOSSIERINFO_DETAILS,
      bijzondereBepalingen: [
        {
          omschrijving: 'Wonen/Koopwoning/Woning',
          titelBestemmingOmschrijving: 'Bestemming',
          categorie: 'Wonen',
          oppervlakte: '0',
          titelOppervlakte: 'Oppervlakte',
          eenheid: 'm² BVO',
          samengesteldeOppervlakteEenheid: ' 0 ',
        },
      ],
    };

    const transformed = forTesting.transformErfpachtDossierProperties(
      source as unknown as ErfpachtDossiersDetailSource
    );

    expect(
      transformed &&
        'bijzondereBepalingen' in transformed &&
        transformed?.bijzondereBepalingen?.[0].samengesteldeOppervlakteEenheid
    ).toBe('-');
  });

  test('transformDossierResponse', () => {
    const transformed = forTesting.transformDossierResponse(
      ERFPACHT_DOSSIERS,
      '123-abc'
    );

    expect(transformed?.isKnown).toBe(true);
    expect(transformed?.relatieCode).toBe('123-abc');
    expect(transformed?.dossiers.dossiers).toHaveLength(15);
    expect(transformed?.dossiers.dossiers.map((d) => d.voorkeursadres)).toEqual(
      [
        '(behorende bij) Dit en dat plein 22 H',
        '(behorende bij) Dit en dat plein 22 H',
        '(behorende bij) Dit en dat plein 22 H',
        'Cycladenlaan 14',
        'Cycladenlaan 14',
        'Cycladenlaan 14',
        'Dit en dat plein 20 H',
        'Dit en dat plein 20 H',
        'Dit en dat plein 20 H',
        'Dit en dat plein 22 H',
        'Dit en dat plein 22 H',
        'Dit en dat plein 22 H',
        'Valutaboulevard 51',
        'Valutaboulevard 51',
        'Valutaboulevard 51',
      ]
    );
  });

  test('transformDossierResponse: null for missing dossiers', () => {
    expect(forTesting.transformDossierResponse(null, '123-abc')).toBeNull();
    expect(
      forTesting.transformDossierResponse(
        {
          ...ERFPACHT_DOSSIERS,
          dossiers: {
            ...ERFPACHT_DOSSIERS.dossiers,
            dossiers: [],
          },
        },
        '123-abc'
      )
    ).toBeNull();
  });

  test('fetchErfpachtDossierInfo', async () => {
    remoteApi
      .get('/erfpacht/vernise/api/dossierinfo')
      .reply(200, ERFPACHT_DOSSIERS);

    const response = await fetchErfpachtDossierInfo(
      '123-abc',
      authProfileAndToken
    );

    expect(response.status).toBe('OK');
    expect(response.content?.relatieCode).toBe('123-abc');
    expect(response.content?.isKnown).toBe(true);
    expect(response.content?.dossiers.dossiers).toHaveLength(15);
  });

  test('fetchErfpachtDossierInfo: error', async () => {
    remoteApi
      .get('/erfpacht/vernise/api/dossierinfo')
      .reply(500, { message: 'Internal server error' });

    const response = await fetchErfpachtDossierInfo(
      '123-abc',
      authProfileAndToken
    );

    expect(response.status).toBe('ERROR');
  });

  test('fetchErfpachtDossiersDetail', async () => {
    remoteApi
      .get('/erfpacht/vernise/api/dossierinfo/E.477.46')
      .reply(200, ERFPACHT_DOSSIERINFO_DETAILS);

    const response = await fetchErfpachtDossiersDetail(
      authProfileAndToken,
      'E.477.46'
    );

    expect(response.status).toBe('OK');
    expect(response.content?.title).toBe('E123/456: Dit en dat plein 22 H');
    expect(response.content?.link.to).toBe('/erfpacht/dossier/E.123.456');
    expect(response.content?.relaties).toHaveLength(2);
    expect(response.content?.juridisch?.ingangsdatum).toBe('24 juni 2022');
  });

  test('fetchErfpachtDossiersDetail: error', async () => {
    remoteApi
      .get('/erfpacht/vernise/api/dossierinfo/E.477.46')
      .reply(500, { message: 'Internal server error' });

    const response = await fetchErfpachtDossiersDetail(
      authProfileAndToken,
      'E.477.46'
    );

    expect(response.status).toBe('ERROR');
  });
});
