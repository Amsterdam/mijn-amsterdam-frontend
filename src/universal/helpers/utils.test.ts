import {
  deepOmitKeys,
  jsonCopy,
  isExternalUrl,
  isInteralUrl,
  sortAlpha,
  range,
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

  it('isInternalUrl: Should check if url is external', () => {
    expect(isInteralUrl('http://example.org')).toBe(false);
    expect(isInteralUrl('http://mijn.amsterdam.nl')).toBe(true);
  });

  it('isExternalUrl: Should check if url is external', () => {
    expect(isExternalUrl('http://example.org')).toBe(true);
    expect(isExternalUrl('http://mijn.amsterdam.nl')).toBe(false);
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
});
