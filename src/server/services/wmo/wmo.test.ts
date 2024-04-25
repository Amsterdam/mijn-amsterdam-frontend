import Mockdate from 'mockdate';
import { remoteApi } from '../../../test-utils';
import WMO from '../../mock-data/json/wmo.json';
import { fetchWmo } from './wmo';

vi.mock('../../../universal/helpers/encrypt-decrypt', () => ({
  encrypt: vi.fn().mockReturnValue(['123-123-123-123', 'xx']),
}));

describe('Transform api items', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  beforeAll(() => {
    Mockdate.set('2023-11-23');
  });

  afterAll(() => {
    Mockdate.reset();
  });

  test('fetchWmo', async () => {
    remoteApi.post('/zorgned/aanvragen').reply(200, WMO);

    expect(
      await fetchWmo('xxxx', {
        profile: {
          id: '123123',
          authMethod: 'digid',
          profileType: 'private',
          sid: '',
        },
        token: '',
      })
    ).toMatchSnapshot();
  });
});
