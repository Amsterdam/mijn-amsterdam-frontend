import { getApiConfig, getCustomApiConfig } from './source-api-helpers';

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
  test('getCustomApiConfig throws when cacheKey_UNSAFE is provided', () => {
    expect(() =>
      getCustomApiConfig({
        cacheKey_UNSAFE: 'should-fail',
      })
    ).toThrow('getCustomApiConfig does not accept cacheKey_UNSAFE in configs');
  });
  test('getCustomApiConfig works without cacheKey_UNSAFE', () => {
    const config = getCustomApiConfig({
      url: 'https://example.com/api',
      method: 'GET',
    });

    expect(config.url).toBe('https://example.com/api');
    expect(config.method).toBe('GET');
  });
  test('getCustomApiConfig merges multiple configs', () => {
    const config = getCustomApiConfig(
      {
        url: 'https://example.com/api',
        method: 'GET',
      },
      {
        headers: {
          'X-Test-Header': 'TestValue',
        },
      }
    );

    expect(config.url).toBe('https://example.com/api');
    expect(config.method).toBe('GET');
    expect(config.headers!['X-Test-Header']).toBe('TestValue');
  });
  test('getCustomApiConfig replaces same header value from multiple configs', () => {
    const config = getCustomApiConfig(
      {
        headers: {
          'X-Test-Header': 'InitialValue',
        },
      },
      {
        headers: {
          'X-Test-Header': 'OverriddenValue',
        },
      }
    );

    expect(config.headers!['X-Test-Header']).toBe('OverriddenValue');
  });
});
