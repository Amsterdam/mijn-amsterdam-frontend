import { getApiConfig } from './source-api-helpers';

describe('Config', () => {
  test('getApiConfig', () => {
    const config = getApiConfig('ERFPACHT', {
      cacheKey_UNSAFE: 'foo',
    });

    config.headers!.Accept = 'foo-bar';

    const config2 = getApiConfig('ERFPACHT');

    expect(config).not.toStrictEqual(config2);
    expect(config.cacheKey_UNSAFE).toBe('ERFPACHT-foo');

    expect('Accept' in config2.headers!).toBe(false);
  });
  test('getApiConfig with custom headers', () => {
    const config = getApiConfig('ERFPACHT', {
      headers: {
        'X-Custom-Header': 'CustomValue',
      },
    });
    expect(config.headers!['X-Custom-Header']).toBe('CustomValue');
  });
  test('getApiConfig without cache key wrapper', () => {
    const config = getApiConfig('ERFPACHT', {
      cacheKey_UNSAFE: 'test',
    });

    expect(config.cacheKey_UNSAFE).toBe('ERFPACHT-test');
  });
});
