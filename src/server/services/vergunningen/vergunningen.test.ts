import MockDate from 'mockdate';
import { afterAll, describe, expect, it } from 'vitest';
import { remoteApi } from '../../../test-utils';
import { jsonCopy } from '../../../universal/helpers';
import { CaseType } from '../../../universal/types/vergunningen';
import { AuthProfileAndToken } from '../../helpers/app';
import vergunningenData from '../../mock-data/json/vergunningen.json';
import {
  BZB,
  BZP,
  Vergunning,
  VergunningenSourceData,
  createVergunningNotification,
  fetchAllVergunningen,
  fetchVergunningenNotifications,
  getVergunningNotifications,
  transformVergunningenData,
} from './vergunningen';

describe('Vergunningen service', () => {
  const DUMMY_RESPONSE = jsonCopy(vergunningenData);

  const authProfileAndToken: AuthProfileAndToken = {
    profile: { authMethod: 'digid', profileType: 'private', id: '', sid: '' },
    token: 'xxxxxx',
  };

  MockDate.set('2022-10-06');

  afterAll(() => {
    MockDate.reset();
  });

  it('should format data correctly', () => {
    expect(
      transformVergunningenData(vergunningenData as VergunningenSourceData)
    ).toMatchSnapshot();
  });

  it('FetchVergunningen: should respond with a success response', async () => {
    remoteApi.get('/decosjoin/getvergunningen').reply(200, DUMMY_RESPONSE);

    const response = await fetchAllVergunningen('x1', authProfileAndToken);
    const successResponse = {
      status: 'OK',
      content: transformVergunningenData(DUMMY_RESPONSE),
    };
    expect(response).toStrictEqual(successResponse);
  });

  it('should should respond with an empty list', async () => {
    remoteApi.get('/decosjoin/getvergunningen').reply(200, []);

    const response = await fetchAllVergunningen('x2', authProfileAndToken);
    const successResponse = {
      status: 'OK',
      content: [],
    };
    expect(response).toStrictEqual(successResponse);
  });

  it('should should respond with an empty list if api returns error', async () => {
    remoteApi.get('/decosjoin/getvergunningen').replyWithError('fat chance!');

    const response = await fetchAllVergunningen('x3', authProfileAndToken);
    const errorResponse = {
      content: null,
      message: 'Error: fat chance!',
      status: 'ERROR',
    };
    expect(response).toStrictEqual(errorResponse);
  });

  it('fetchVergunningenNotifications private', async () => {
    remoteApi.get('/decosjoin/getvergunningen').reply(200, DUMMY_RESPONSE);

    const response = await fetchVergunningenNotifications(
      'x4',
      authProfileAndToken,
      new Date('2020-06-23')
    );

    expect(response).toMatchSnapshot();
  });

  it('fetchVergunningenNotifications commercial', async () => {
    remoteApi.get('/decosjoin/getvergunningen').reply(200, DUMMY_RESPONSE);

    const response = await fetchVergunningenNotifications(
      'x4',
      {
        profile: {
          authMethod: 'eherkenning',
          profileType: 'commercial',
          id: '',
          sid: '',
        },
        token: 'xxxxxx',
      },
      new Date('2020-06-23')
    );

    expect(response).toMatchSnapshot();
  });

  it('fetchVergunningenNotifications BZP/BZB', async () => {
    const zaken = DUMMY_RESPONSE.content.filter((x: BZP | BZB) =>
      x.caseType.includes('Blauwe zone')
    );

    remoteApi.get('/decosjoin/getvergunningen').reply(200, { content: zaken });

    const response = await fetchVergunningenNotifications(
      'x5',
      authProfileAndToken,
      new Date('2022-09-20')
    );

    expect(response).toMatchSnapshot();
  });

  describe('getVergunningNotifications', () => {
    const vergunning: Vergunning = {
      caseType: CaseType.BZP,
      dateDecision: '2022-09-01',
      dateEnd: '2022-09-30',
      dateRequest: '2022-08-31',
      dateStart: '2022-09-01',
      dateWorkflowActive: '2022-08-31',
      decision: 'Verleend',
      description: 'Ontheffing Blauwe Zone Bewoner',
      documentsUrl:
        '/decosjoin/listdocuments/gAAAAABjKYDIW5uIPJMbvPENwMiCHvpFMqPWpGFgnJllKUUZrEDsNjSjcsxQ8gUJ5O0Ub9j5XyXot8je3Ao8BLEvPF0W3CpOmtnQYO2uOSChEpabt70mV3C6Pu7LFwlTo-RVEvHB-4r_',
      id: '162761969',
      identifier: 'Z/22/19795384',
      kenteken: 'GE-12-XD | XY-666-Z',
      status: 'Afgehandeld',
      title: 'Parkeerontheffingen Blauwe zone particulieren',
      processed: true,
      link: {
        to: 'https://some.page',
        title: 'Bekijk details',
      },
    };

    it('Returns notification', () => {
      expect(getVergunningNotifications([vergunning], new Date('2022-08-14')))
        .toMatchInlineSnapshot(`
        [
          {
            "chapter": "VERGUNNINGEN",
            "datePublished": "2022-06-30",
            "description": "Uw ontheffing blauwe zone (GE-12-XD | XY-666-Z) loopt op 30 september 2022 af.",
            "id": "vergunning-162761969-notification",
            "link": {
              "title": "Vraag op tijd een nieuwe ontheffing aan",
              "to": "https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/Ontheffingblauwezone.aspx",
            },
            "subject": "162761969",
            "title": "Uw ontheffing blauwe zone verloopt binnenkort",
          },
        ]
      `);
      expect(getVergunningNotifications([vergunning], new Date('2022-10-14')))
        .toMatchInlineSnapshot(`
        [
          {
            "chapter": "VERGUNNINGEN",
            "datePublished": "2022-09-30",
            "description": "Uw ontheffing blauwe zone (GE-12-XD | XY-666-Z) is op 30 september 2022 verlopen.",
            "id": "vergunning-162761969-notification",
            "link": {
              "title": "Vraag een nieuwe ontheffing aan",
              "to": "https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/Ontheffingblauwezone.aspx",
            },
            "subject": "162761969",
            "title": "Uw ontheffing blauwe zone is verlopen",
          },
        ]
      `);
    });

    it('Exludes Expired notification', () => {
      expect(
        getVergunningNotifications([vergunning], new Date('2023-10-14'))
      ).toMatchInlineSnapshot('[]');
    });

    it('Exludes null notification', () => {
      const vergunningNew = jsonCopy(vergunning);
      vergunningNew.caseType = 'Non_Existant';
      expect(
        getVergunningNotifications([vergunningNew], new Date('2022-09-14'))
      ).toMatchInlineSnapshot('[]');
    });

    it('createVergunningNotification: Creates notification', () => {
      expect(
        createVergunningNotification(vergunning, [], new Date('2022-09-14'))
      ).not.toBe(null);
    });

    it('createVergunningNotification: Returns null', () => {
      const vergunningNew = jsonCopy(vergunning);
      vergunningNew.caseType = 'Non_Existant';
      expect(
        createVergunningNotification(vergunningNew, [], new Date('2022-09-14'))
      ).toBe(null);
    });
  });
});
