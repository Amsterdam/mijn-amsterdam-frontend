import { getApiConfig } from './source-api-helpers';

describe('Config', () => {
  test('getApiConfig', () => {
    const config = getApiConfig('ERFPACHT', {
      cacheKey_UNSAFE: 'foo',
    });

    config.headers!.Accept = 'foo-bar';

    const config2 = getApiConfig('ERFPACHT');

    expect(config).not.toStrictEqual(config2);
    expect(config.cacheKey_UNSAFE).toBe('foo');

    expect('Accept' in config2.headers!).toBe(false);
  });
});
