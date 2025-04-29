import { describe, expect, beforeEach, afterEach, vi, it } from 'vitest';

import { fetchAVG, fetchAVGNotifications, transformAVGResponse } from './avg';
import avgThemasResponse from '../../../../mocks/fixtures/avg-themas.json';
import apiResponse from '../../../../mocks/fixtures/avg.json';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils';

describe('AVG', () => {
  const requestId = '456';

  const profileAndToken = getAuthProfileAndToken();

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('transformKlachtenResponse', () => {
    beforeEach(() => {
      remoteApi
        .post('/smile', /readavgverzoek/gi)
        .reply(200, apiResponse)
        .post('/smile', /readthemaperavgverzoek/gi)
        .reply(200, avgThemasResponse);
    });

    it('should transform the data correctly', () => {
      const res = transformAVGResponse(apiResponse);

      expect(res.verzoeken.length).toEqual(apiResponse.List.length);

      expect(res.verzoeken[2]).toEqual({
        datumAfhandeling: '2023-03-19T00:00:00.000Z',
        datumInBehandeling: '2023-03-16T00:00:00.000Z',
        id: '223',
        link: {
          title: 'AVG verzoek 223',
          to: '/avg/verzoek/223',
        },
        ontvangstDatum: '2022-03-09T00:00:00.000Z',
        ontvangstDatumFormatted: '09 maart 2022',
        opschortenGestartOp: '',
        registratieDatum: '2023-03-16T00:00:00.000Z',
        resultaat: '',
        displayStatus: 'Afgehandeld',
        steps: [
          {
            datePublished: '2022-03-09T00:00:00.000Z',
            description: '',
            documents: [],
            id: 'item-1',
            isActive: false,
            isChecked: true,
            status: 'Ontvangen',
          },
          {
            datePublished: '2023-03-16T00:00:00.000Z',
            description: '',
            documents: [],
            id: 'item-3',
            isActive: false,
            isChecked: true,
            status: 'In behandeling',
          },
          {
            datePublished: '2023-03-19T00:00:00.000Z',
            description:
              'Uw verzoek is afgehandeld. U ontvangt hierover bericht per e-mail of per brief.',
            documents: [],
            id: 'last-item',
            isActive: true,
            isChecked: true,
            status: 'Afgehandeld',
          },
        ],
        themas: '',
        title: 'AVG verzoek 223',
        toelichting: 'Iets over vergunningen',
        type: 'Verwijderen gegevens',
      });
    });

    it('should return data in expected format', async () => {
      const res = await fetchAVG(requestId, profileAndToken);

      expect(res).toEqual({
        content: {
          aantal: 6,
          verzoeken: [
            {
              datumAfhandeling: '',
              datumInBehandeling: '',
              id: '1',
              link: {
                title: 'AVG verzoek 1',
                to: '/avg/verzoek/1',
              },
              ontvangstDatum: '2023-03-06T00:00:00.000Z',
              ontvangstDatumFormatted: '06 maart 2023',
              opschortenGestartOp: '2023-03-16T00:00:00.000Z',
              registratieDatum: '',
              resultaat: '',
              displayStatus: 'Open',
              steps: [
                {
                  datePublished: '2023-03-06T00:00:00.000Z',
                  description: '',
                  documents: [],
                  id: 'item-1',
                  isActive: false,
                  isChecked: true,
                  status: 'Ontvangen',
                },
                {
                  datePublished: '2023-03-16T00:00:00.000Z',
                  description:
                    'Wij hebben meer informatie nodig om uw verzoek in behandeling te nemen. U krijgt een brief waarin staat welke informatie wij nodig hebben.',
                  documents: [],
                  id: 'item-2',
                  isActive: true,
                  isChecked: false,
                  status: 'Meer informatie nodig',
                },
                {
                  datePublished: '',
                  description: '',
                  documents: [],
                  id: 'item-3',
                  isActive: false,
                  isChecked: false,
                  status: 'In behandeling',
                },
                {
                  datePublished: '',
                  description: '',
                  documents: [],
                  id: 'last-item',
                  isActive: false,
                  isChecked: false,
                  status: 'Afgehandeld',
                },
              ],
              themas: 'avg thema 2',
              title: 'AVG verzoek 1',
              toelichting: 'Iets met parkeren',
              type: 'Inzage',
            },
            {
              datumAfhandeling: '',
              datumInBehandeling: '2023-03-30T00:00:00.000Z',
              id: '2',
              link: {
                title: 'AVG verzoek 2',
                to: '/avg/verzoek/2',
              },
              ontvangstDatum: '2023-03-08T00:00:00.000Z',
              ontvangstDatumFormatted: '08 maart 2023',
              opschortenGestartOp: '',
              registratieDatum: '2023-03-30T00:00:00.000Z',
              resultaat: '',
              displayStatus: 'Open',
              steps: [
                {
                  datePublished: '2023-03-08T00:00:00.000Z',
                  description: '',
                  documents: [],
                  id: 'item-1',
                  isActive: false,
                  isChecked: true,
                  status: 'Ontvangen',
                },
                {
                  datePublished: '2023-03-30T00:00:00.000Z',
                  description: '',
                  documents: [],
                  id: 'item-3',
                  isActive: true,
                  isChecked: true,
                  status: 'In behandeling',
                },
                {
                  datePublished: '',
                  description: '',
                  documents: [],
                  id: 'last-item',
                  isActive: false,
                  isChecked: false,
                  status: 'Afgehandeld',
                },
              ],
              themas: 'avg thema 3',
              title: 'AVG verzoek 2',
              toelichting: 'Iets over vergunningen',
              type: 'Verwijderen gegevens',
            },
            {
              datumAfhandeling: '2023-03-19T00:00:00.000Z',
              datumInBehandeling: '2023-03-16T00:00:00.000Z',
              id: '223',
              link: {
                title: 'AVG verzoek 223',
                to: '/avg/verzoek/223',
              },
              ontvangstDatum: '2022-03-09T00:00:00.000Z',
              ontvangstDatumFormatted: '09 maart 2022',
              opschortenGestartOp: '',
              registratieDatum: '2023-03-16T00:00:00.000Z',
              resultaat: '',
              displayStatus: 'Afgehandeld',
              steps: [
                {
                  datePublished: '2022-03-09T00:00:00.000Z',
                  description: '',
                  documents: [],
                  id: 'item-1',
                  isActive: false,
                  isChecked: true,
                  status: 'Ontvangen',
                },
                {
                  datePublished: '2023-03-16T00:00:00.000Z',
                  description: '',
                  documents: [],
                  id: 'item-3',
                  isActive: false,
                  isChecked: true,
                  status: 'In behandeling',
                },
                {
                  datePublished: '2023-03-19T00:00:00.000Z',
                  description:
                    'Uw verzoek is afgehandeld. U ontvangt hierover bericht per e-mail of per brief.',
                  documents: [],
                  id: 'last-item',
                  isActive: true,
                  isChecked: true,
                  status: 'Afgehandeld',
                },
              ],
              themas: 'avg thema 3',
              title: 'AVG verzoek 223',
              toelichting: 'Iets over vergunningen',
              type: 'Verwijderen gegevens',
            },
            {
              datumAfhandeling: '2023-03-25T00:00:00.000Z',
              datumInBehandeling: '2023-03-20T00:00:00.000Z',
              id: '425',
              link: {
                title: 'AVG verzoek 425',
                to: '/avg/verzoek/425',
              },
              ontvangstDatum: '2022-03-10T00:00:00.000Z',
              ontvangstDatumFormatted: '10 maart 2022',
              opschortenGestartOp: '2022-03-12T00:00:00.000Z',
              registratieDatum: '2023-03-20T00:00:00.000Z',
              resultaat: '',
              displayStatus: 'Afgehandeld',
              steps: [
                {
                  datePublished: '2022-03-10T00:00:00.000Z',
                  description: '',
                  documents: [],
                  id: 'item-1',
                  isActive: false,
                  isChecked: true,
                  status: 'Ontvangen',
                },
                {
                  datePublished: '2022-03-12T00:00:00.000Z',
                  description: '',
                  documents: [],
                  id: 'item-2',
                  isActive: false,
                  isChecked: true,
                  status: 'Meer informatie nodig',
                },
                {
                  datePublished: '2023-03-20T00:00:00.000Z',
                  description:
                    'Wij hebben meer informatie nodig om uw verzoek in behandeling te nemen. U krijgt een brief waarin staat welke informatie wij nodig hebben.',
                  documents: [],
                  id: 'item-3',
                  isActive: false,
                  isChecked: true,
                  status: 'In behandeling',
                },
                {
                  datePublished: '2023-03-25T00:00:00.000Z',
                  description:
                    'Uw verzoek is afgehandeld. U ontvangt hierover bericht per e-mail of per brief.',
                  documents: [],
                  id: 'last-item',
                  isActive: true,
                  isChecked: true,
                  status: 'Afgehandeld',
                },
              ],
              themas: 'avg thema 2',
              title: 'AVG verzoek 425',
              toelichting: 'Iets over vergunningen',
              type: 'Verwijderen gegevens',
            },
            {
              datumAfhandeling: '',
              datumInBehandeling: '2023-05-30T00:00:00.000Z',
              id: '561',
              link: {
                title: 'AVG verzoek 561',
                to: '/avg/verzoek/561',
              },
              ontvangstDatum: '2023-03-18T00:00:00.000Z',
              ontvangstDatumFormatted: '18 maart 2023',
              opschortenGestartOp: '2023-06-03T00:00:00.000Z',
              registratieDatum: '2023-05-30T00:00:00.000Z',
              resultaat: '',
              displayStatus: 'Open',
              steps: [
                {
                  datePublished: '2023-03-18T00:00:00.000Z',
                  description: '',
                  documents: [],
                  id: 'item-1',
                  isActive: false,
                  isChecked: true,
                  status: 'Ontvangen',
                },
                {
                  datePublished: '2023-05-30T00:00:00.000Z',
                  description: '',
                  documents: [],
                  id: 'item-3',
                  isActive: false,
                  isChecked: true,
                  status: 'In behandeling',
                },
                {
                  datePublished: '2023-06-03T00:00:00.000Z',
                  description:
                    'Wij hebben meer informatie nodig om uw verzoek in behandeling te nemen. U krijgt een brief waarin staat welke informatie wij nodig hebben.',
                  documents: [],
                  id: 'item-2',
                  isActive: true,
                  isChecked: true,
                  status: 'Meer informatie nodig',
                },
                {
                  datePublished: '',
                  description: '',
                  documents: [],
                  id: 'last-item',
                  isActive: false,
                  isChecked: false,
                  status: 'Afgehandeld',
                },
              ],
              themas: 'avg thema 1, avg thema 2, avg thema 3, avg thema 4',
              title: 'AVG verzoek 561',
              toelichting: 'Iets over mileu',
              type: 'Aanpassen gegevens',
            },
            {
              datumAfhandeling: '',
              datumInBehandeling: '',
              id: '156',
              link: {
                title: 'AVG verzoek 156',
                to: '/avg/verzoek/156',
              },
              ontvangstDatum: '2023-03-18T00:00:00.000Z',
              ontvangstDatumFormatted: '18 maart 2023',
              opschortenGestartOp: '',
              registratieDatum: '',
              resultaat: '',
              displayStatus: 'Open',
              steps: [
                {
                  datePublished: '2023-03-18T00:00:00.000Z',
                  description: '',
                  documents: [],
                  id: 'item-1',
                  isActive: true,
                  isChecked: true,
                  status: 'Ontvangen',
                },
                {
                  datePublished: '',
                  description: '',
                  documents: [],
                  id: 'item-3',
                  isActive: false,
                  isChecked: false,
                  status: 'In behandeling',
                },
                {
                  datePublished: '',
                  description: '',
                  documents: [],
                  id: 'last-item',
                  isActive: false,
                  isChecked: false,
                  status: 'Afgehandeld',
                },
              ],
              themas: 'avg thema 1',
              title: 'AVG verzoek 156',
              toelichting: 'Iets over mileu',
              type: 'Aanpassen gegevens',
            },
          ],
        },
        status: 'OK',
      });
    });

    it('should return the right notifications', async () => {
      const res = await fetchAVGNotifications(requestId, profileAndToken);

      expect(res).toEqual({
        content: {
          notifications: [
            {
              datePublished: '2023-03-16T00:00:00.000Z',
              description:
                'Wij hebben meer informatie nodig om uw verzoek in behandeling te nemen. U krijgt een brief of e-mail waarin staat welke informatie wij nodig hebben.',
              id: 'avg-1-notification',
              link: {
                title: 'Bekijk details',
                to: '/avg/verzoek/1',
              },
              themaID: 'AVG',
              themaTitle: 'AVG persoonsgegevens',
              title: 'AVG verzoek meer informatie nodig',
            },
            {
              datePublished: '2023-03-30T00:00:00.000Z',
              description: 'Uw AVG verzoek is in behandeling genomen.',
              id: 'avg-2-notification',
              link: {
                title: 'Bekijk details',
                to: '/avg/verzoek/2',
              },
              themaID: 'AVG',
              themaTitle: 'AVG persoonsgegevens',
              title: 'AVG verzoek in behandeling',
            },
            {
              datePublished: '2023-03-19T00:00:00.000Z',
              description:
                'Uw verzoek is afgehandeld. U ontvangt of U heeft hierover bericht gekregen per e-mail of per brief.',
              id: 'avg-223-notification',
              link: {
                title: 'Bekijk details',
                to: '/avg/verzoek/223',
              },
              themaID: 'AVG',
              themaTitle: 'AVG persoonsgegevens',
              title: 'AVG verzoek afgehandeld',
            },
            {
              datePublished: '2023-03-25T00:00:00.000Z',
              description:
                'Uw verzoek is afgehandeld. U ontvangt of U heeft hierover bericht gekregen per e-mail of per brief.',
              id: 'avg-425-notification',
              link: {
                title: 'Bekijk details',
                to: '/avg/verzoek/425',
              },
              themaID: 'AVG',
              themaTitle: 'AVG persoonsgegevens',
              title: 'AVG verzoek afgehandeld',
            },
            {
              datePublished: '2023-06-03T00:00:00.000Z',
              description:
                'Wij hebben meer informatie nodig om uw verzoek in behandeling te nemen. U krijgt een brief of e-mail waarin staat welke informatie wij nodig hebben.',
              id: 'avg-561-notification',
              link: {
                title: 'Bekijk details',
                to: '/avg/verzoek/561',
              },
              themaID: 'AVG',
              themaTitle: 'AVG persoonsgegevens',
              title: 'AVG verzoek meer informatie nodig',
            },
            {
              datePublished: '2023-03-18T00:00:00.000Z',
              description: 'Uw AVG verzoek is ontvangen.',
              id: 'avg-156-notification',
              link: {
                title: 'Bekijk details',
                to: '/avg/verzoek/156',
              },
              themaID: 'AVG',
              themaTitle: 'AVG persoonsgegevens',
              title: 'AVG verzoek ontvangen',
            },
          ],
        },
        status: 'OK',
      });
    });
  });
});
