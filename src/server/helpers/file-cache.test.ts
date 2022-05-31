import FileCache from './file-cache';

jest.mock('flat-cache', () => {
  const cache: { [key: string]: any } = {};

  return {
    setKey: jest.fn(),
    load: () => ({
      setKey: (key: string, data: any) => {
        cache[key] = data;
      },
      getKey: (key: string) => cache[key],
      save: jest.fn(),
      keys: () => Object.keys(cache),
    }),
  };
});

describe('FileCache', () => {
  it('should function as expected', () => {
    const fileCache = new FileCache({
      name: 'test',
      triesUntilConsiderdStale: 2,
    });

    const data = 'test-data';

    fileCache.setKey('test', data);

    expect(fileCache.getKey('test')).toEqual(data);
  });

  it.each([1, 3, 8])(
    'should return true if cache is same %i times',
    (triesUntilConsiderdStale) => {
      const fileCache = new FileCache({
        name: 'test',
        triesUntilConsiderdStale,
      });

      for (let index = 0; index < triesUntilConsiderdStale; index++) {
        fileCache.setKey('test', 'test-data');

        fileCache.save();
      }

      expect(fileCache.isStale()).toBe(true);
    }
  );

  it('should return false when cached data is different', () => {
    const fileCache = new FileCache({
      name: 'test',
      triesUntilConsiderdStale: 2,
    });

    fileCache.setKey('test', 'test-data');
    fileCache.save();

    fileCache.setKey('test', 'test-data-2');
    fileCache.save();

    expect(fileCache.isStale()).toEqual(false);
  });
});
