import MockDate from 'mockdate';
import { afterAll, describe, expect, it } from 'vitest';
import { remoteApi } from '../../../test-utils';
import { jsonCopy } from '../../../universal/helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import vergunningenData from '../../mock-data/json/vergunningen.json';
import {
  BZB,
  BZP,
  fetchAllVergunningen,
  fetchVergunningenNotifications,
  transformVergunningenData,
  VergunningenSourceData,
} from './vergunningen';

describe('Vergunningen service', () => {
  const DUMMY_RESPONSE = jsonCopy(vergunningenData);

  const authProfileAndToken: AuthProfileAndToken = {
    profile: { authMethod: 'digid', profileType: 'private' },
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

  it('fetchVergunningenNotifications', async () => {
    remoteApi.get('/decosjoin/getvergunningen').reply(200, DUMMY_RESPONSE);

    const response = await fetchVergunningenNotifications(
      'x4',
      authProfileAndToken,
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
});
