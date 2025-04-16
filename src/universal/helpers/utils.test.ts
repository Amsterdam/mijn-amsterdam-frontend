import {
  deepOmitKeys,
  jsonCopy,
  sortAlpha,
  range,
  isRecentNotification,
  toDateFormatted,
} from './utils';
describe('Utils.ts', () => {
  it('deepOmitKeys: Should omit keys recursively', () => {
    const testData = {
      foo: [
        {
          foo: {
            bar: 'hey',
            rab: [{ bar: 'hey', description: 'bla bla bla' }],
          },
        },
      ],
      description: 'bla bla bla',
    };
    const testDataWithKeysOmitted = {
      foo: [
        {
          foo: {
            rab: [{}],
          },
        },
      ],
    };
    expect(deepOmitKeys(testData, ['bar', 'description'])).toEqual(
      testDataWithKeysOmitted
    );
  });

  it('jsonCopy: Should make a copy of data', () => {
    const testData = { foo: 'bar', hello: { foo: 'bar' } };
    const testDataCopied = jsonCopy(testData);
    expect(testData !== testDataCopied).toBe(true);
    expect(testData.hello !== testDataCopied.hello).toBe(true);
  });

  it('sortAlpha: Should sort array of object by key => value', () => {
    const testData = [
      { foo: 'bar' },
      { foo: 'alpha' },
      { foo: 'consortium' },
      { foo: 'beta' },
    ];
    const testDataSorted = [
      { foo: 'alpha' },
      { foo: 'bar' },
      { foo: 'beta' },
      { foo: 'consortium' },
    ];
    expect(testData.sort(sortAlpha('foo'))).toEqual(testDataSorted);
  });

  it('range: Should generate a range', () => {
    expect(range(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  test('isRecentNotification', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2022-10-06'));

    expect(isRecentNotification('2022-12-06')).toBe(true);
    expect(isRecentNotification('2023-01-07')).toBe(false);
  });

  describe('toDateFormatted', () => {
    test('has date', () => {
      expect(toDateFormatted('2024-05-04')).toBe('04 mei 2024');
    });
    test('has no date', () => {
      expect(toDateFormatted(null)).toBe(null);
    });
  });
});
