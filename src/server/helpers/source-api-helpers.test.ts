import { getApiConfig } from './source-api-helpers';

describe('Config', () => {
  test('getApiConfig', () => {
    const config = getApiConfig('ERFPACHT', {
      cacheKey_UNSAFE: 'foo',
    });

    config.headers!.Accept = 'foo-bar';

    const config2 = getApiConfig('ERFPACHT');

    expect(config).not.toStrictEqual(config2);
    // Because we are using a stack trace to generate a cache key, the value can change if the underlying code changes.
    expect(config.cacheKey_UNSAFE).toBe(
      'ERFPACHT-runTest.runWithTimeout.Promise-foo'
    );

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
    const config = getApiConfig(
      'ERFPACHT',
      {
        cacheKey_UNSAFE: 'foo',
      },
      {
        useApiConfigBasedCallstackCacheKeyTransform: false,
      }
    );

    expect(config.cacheKey_UNSAFE).toBe('foo');
  });
});
