import { getApiConfig } from './config';

describe('Config', () => {
  test('getApiConfig', () => {
    const config = getApiConfig('ERFPACHTv2');

    config.headers!.Accept = 'foo-bar';

    const config2 = getApiConfig('ERFPACHTv2');

    expect(config).not.toStrictEqual(config2);

    expect('Accept' in config2.headers!).toBe(false);
  });
});
