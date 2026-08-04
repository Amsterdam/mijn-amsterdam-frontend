import mockdate from 'mockdate';

import {
  fetchErfpachtNotifications,
  forTesting,
} from './erfpacht-notifications.ts';
import { ZAAK_STATUS_FRONTEND } from './erfpacht-zaken-config.ts';
import type { ErfpachtZaakExcerptFrontend } from './erfpacht-zaken-types.ts';
import { getAuthProfileAndToken } from '../../../testing/utils.ts';
import {
  apiErrorResult,
  apiSuccessResult,
} from '../../../universal/helpers/api.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';

const { fetchErfpachtZaakInfoMock } = vi.hoisted(() => ({
  fetchErfpachtZaakInfoMock: vi.fn(),
}));

vi.mock('./erfpacht-zaken.ts', async (importOriginal) => {
  const actual: object = await importOriginal();
  return {
    ...actual,
    fetchErfpachtZaakInfo: fetchErfpachtZaakInfoMock,
  };
});

function createZaakExcerpt(
  overrides: Partial<ErfpachtZaakExcerptFrontend> = {}
): ErfpachtZaakExcerptFrontend {
  const base: ErfpachtZaakExcerptFrontend = {
    zaakNummer: 'ZAAK-2025-0000011488',
    zaakUuid: '1234-5678-9012-9999',
    zaakOmschrijving: 'Wijzigen Erfpachtrecht',
    statusOmschrijving: 'Aanvraag Beoordelen',
    formattedStatusDatum: '15-07-2026',
    zaakUrl: 'https://example.invalid/zaak/1234-5678-9012-9999',
    zaakDossiers: ['EW123/456'],
    titelZaakNummer: 'Zaak nummer',
    titelZaakOmschrijving: 'Zaak onderwerp',
    titelStatusOmschrijving: 'Status',
    titelFormattedStatusDatum: 'Datum status',
    datePublished: '2026-07-15T00:00:00.000Z',
    datePublishedFormatted: '15 juli 2026',
    fetchZaakDetailUrl:
      'http://bff-api-host/api/v1/services/erfpacht/zaak/1234-5678-9012-9999',
    link: {
      to: '/erfpacht/zaak/1234-5678-9012-9999',
      title: 'Wijzigen Erfpachtrecht',
    },
    displayStatus: ZAAK_STATUS_FRONTEND.AANVRAAG,
    dossierLinks: ['EW123/456'],
  };

  return {
    ...base,
    ...overrides,
  };
}

describe('erfpacht-notifications', () => {
  const authProfileAndToken: AuthProfileAndToken = getAuthProfileAndToken();

  beforeEach(() => {
    fetchErfpachtZaakInfoMock.mockReset();
    mockdate.set('2026-07-29T10:00:00.000Z');
  });

  afterAll(() => {
    mockdate.reset();
  });

  describe('getTitleAndDescriptionForNotification', () => {
    test('maps each known status to the expected title and description', () => {
      const { getTitleAndDescriptionForNotification } = forTesting;

      expect(
        getTitleAndDescriptionForNotification(
          createZaakExcerpt({
            displayStatus: ZAAK_STATUS_FRONTEND.AANVRAAG,
            zaakNummer: 'ZAAK-1',
          })
        )
      ).toMatchInlineSnapshot(`
        {
          "description": "Wij zijn bezig met het beoordelen van uw aanvraag.",
          "title": "ZAAK-1: Aanvraag Beoordelen",
        }
      `);

      expect(
        getTitleAndDescriptionForNotification(
          createZaakExcerpt({
            displayStatus: ZAAK_STATUS_FRONTEND.IN_BEHANDELING,
            zaakNummer: 'ZAAK-3',
          })
        )
      ).toMatchInlineSnapshot(`
        {
          "description": "Wij zijn bezig met het beoordelen van uw aanvraag.",
          "title": "ZAAK-3: Aanvraag Beoordelen",
        }
      `);

      expect(
        getTitleAndDescriptionForNotification(
          createZaakExcerpt({
            displayStatus: ZAAK_STATUS_FRONTEND.AFGEHANDELD,
            zaakNummer: 'ZAAK-4',
          })
        )
      ).toMatchInlineSnapshot(`
        {
          "description": "Wij zijn bezig met het beoordelen van uw aanvraag.",
          "title": "ZAAK-4: Aanvraag Beoordelen",
        }
      `);
    });

    test('falls back to default title/description for unknown status', () => {
      const { getTitleAndDescriptionForNotification } = forTesting;

      const result = getTitleAndDescriptionForNotification(
        createZaakExcerpt({ displayStatus: 'Onbekend' })
      );

      expect(result).toMatchInlineSnapshot(`
        {
          "description": "Wij zijn bezig met het beoordelen van uw aanvraag.",
          "title": "ZAAK-2025-0000011488: Aanvraag Beoordelen",
        }
      `);
    });
  });

  test('fetchErfpachtNotifications: forwards dependency error', async () => {
    const dependencyError = apiErrorResult('boom', null);
    fetchErfpachtZaakInfoMock.mockResolvedValue(dependencyError);

    const result = await fetchErfpachtNotifications(authProfileAndToken);

    expect(result).toEqual(dependencyError);
  });

  test('fetchErfpachtNotifications: filters outdated afgehandeld and missing dates', async () => {
    fetchErfpachtZaakInfoMock.mockResolvedValue(
      apiSuccessResult([
        createZaakExcerpt({
          zaakUuid: 'ongoing-1',
          displayStatus: ZAAK_STATUS_FRONTEND.IN_BEHANDELING,
          datePublished: '2025-01-01T00:00:00.000Z',
        }),
        createZaakExcerpt({
          zaakUuid: 'done-recent',
          displayStatus: ZAAK_STATUS_FRONTEND.AFGEHANDELD,
          datePublished: '2026-06-15T00:00:00.000Z',
        }),
        createZaakExcerpt({
          zaakUuid: 'done-old',
          displayStatus: ZAAK_STATUS_FRONTEND.AFGEHANDELD,
          datePublished: '2025-01-01T00:00:00.000Z',
        }),
        createZaakExcerpt({
          zaakUuid: 'no-date',
          displayStatus: ZAAK_STATUS_FRONTEND.AANVRAAG,
          datePublished: null,
        }),
      ])
    );

    const result = await fetchErfpachtNotifications(authProfileAndToken);

    expect(result.status).toBe('OK');
    expect(result.content?.notifications).toHaveLength(2);
    expect(result.content?.notifications.map((n) => n.id)).toEqual([
      'erfpacht-ongoing-1-notification',
      'erfpacht-done-recent-notification',
    ]);
    expect(result.content?.notifications[0].link).toMatchInlineSnapshot(`
      {
        "title": "Bekijk uw aanvraag",
        "to": "/erfpacht/zaak/1234-5678-9012-9999",
      }
    `);
  });

  test('fetchErfpachtNotifications: builds themed notifications', async () => {
    fetchErfpachtZaakInfoMock.mockResolvedValue(
      apiSuccessResult([
        createZaakExcerpt({
          zaakUuid: '1234-5678-9012-9999',
          datePublished: '2026-07-15T00:00:00.000Z',
          displayStatus: ZAAK_STATUS_FRONTEND.AANVRAAG,
          link: {
            to: '/erfpacht/zaak/1234-5678-9012-9999',
            title: 'Original title',
          },
        }),
      ])
    );

    const result = await fetchErfpachtNotifications(authProfileAndToken);

    expect(result).toMatchInlineSnapshot(`
      {
        "content": {
          "notifications": [
            {
              "datePublished": "2026-07-15T00:00:00.000Z",
              "description": "Wij zijn bezig met het beoordelen van uw aanvraag.",
              "id": "erfpacht-1234-5678-9012-9999-notification",
              "link": {
                "title": "Bekijk uw aanvraag",
                "to": "/erfpacht/zaak/1234-5678-9012-9999",
              },
              "themaID": "ERFPACHT",
              "themaTitle": "Erfpacht",
              "title": "ZAAK-2025-0000011488: Aanvraag Beoordelen",
            },
          ],
        },
        "status": "OK",
      }
    `);
  });
});
