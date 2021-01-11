import { apiSuccesResult } from '../../../universal/helpers/api';
import FileCache from '../../helpers/file-cache';
import { requestData } from '../../helpers/source-api-request';
import { fetchDataset, loadDatasetFeatures } from './buurt';
import { BUURT_CACHE_TTL_1_DAY_IN_MINUTES, DatasetConfig } from './datasets';
import {
  createDynamicFilterConfig,
  getDynamicDatasetFilters,
  datasetApiResult,
} from './helpers';

const DUMMY_DATA_RESPONSE = apiSuccesResult([
  { properties: { foo: 'bar', bar: undefined } },
  { properties: { foo: 'hop', bar: true } },
]);

const DUMMY_DATA_RESPONSE2 = apiSuccesResult([
  { properties: { hello: 'world', world: 'peace' } },
  { properties: { hello: 'you', world: 'equality' } },
]);

const sessionID = 'xxxx';
const datasetId = 'test-dataset';
const datasetId2 = 'test-dataset2';

const datasetConfig: DatasetConfig = {
  listUrl: 'http://url.to/api/foo',
  detailUrl: 'http://url.to/api/detail/foo',
  transformList: (r: any) => r,
  featureType: 'Point',
  cacheTimeMinutes: BUURT_CACHE_TTL_1_DAY_IN_MINUTES,
};

const datasetConfig2: DatasetConfig = {
  listUrl: 'http://url.to/api/hello',
  detailUrl: 'http://url.to/api/detail/hello',
  transformList: (r: any) => r,
  featureType: 'Point',
  cacheTimeMinutes: BUURT_CACHE_TTL_1_DAY_IN_MINUTES,
};

const params = {};

const DATASET_FILTER_CONFIG_MOCK = 'test';
const DATASET_FILTERS_MOCK = {
  foo: {
    Bar: 1,
    Hop: 1,
  },
  bar: {
    Undefined: 1,
    True: 1,
  },
};

const SERVICE_RESULT = apiSuccesResult({
  features: DUMMY_DATA_RESPONSE.content,
  filters: DATASET_FILTERS_MOCK,
});

const SERVICE_RESULT2 = apiSuccesResult({
  features: DUMMY_DATA_RESPONSE2.content,
});

jest.mock('./helpers');
jest.mock('../../helpers/source-api-request');
jest.mock('../../helpers/file-cache');
jest.mock('../../../universal/config/env', () => {
  return {
    IS_AP: true,
  };
});
jest.mock('../../../universal/config/buurt');

const cacheGetKey = jest.fn();
const cacheSetKey = jest.fn();
const cacheSave = jest.fn();

function mockFileCache() {
  return {
    getKey: cacheGetKey,
    setKey: cacheSetKey,
    save: cacheSave,
  };
}

describe('Buurt services', () => {
  it('Should fetchDataset', async () => {
    (FileCache as jest.Mock).mockImplementation(mockFileCache);
    (requestData as jest.Mock).mockResolvedValue(DUMMY_DATA_RESPONSE);
    (getDynamicDatasetFilters as jest.Mock).mockReturnValue(
      DATASET_FILTER_CONFIG_MOCK
    );
    (createDynamicFilterConfig as jest.Mock).mockReturnValue(
      DATASET_FILTERS_MOCK
    );

    // First call fetches data from source api
    const result = await fetchDataset(
      sessionID,
      datasetId,
      datasetConfig,
      params
    );

    expect(cacheGetKey).toHaveBeenCalled();
    expect(FileCache).toHaveBeenCalledWith({
      name: datasetId,
      cacheTimeMinutes: BUURT_CACHE_TTL_1_DAY_IN_MINUTES,
    });
    expect(requestData).toHaveBeenCalled();
    expect(getDynamicDatasetFilters).toHaveBeenCalledWith(datasetId);
    expect(createDynamicFilterConfig).toHaveBeenCalledWith(
      DUMMY_DATA_RESPONSE.content,
      DATASET_FILTER_CONFIG_MOCK
    );
    expect(cacheSetKey.mock.calls).toEqual([
      ['url', datasetConfig.listUrl],
      ['features', DUMMY_DATA_RESPONSE.content],
      ['filters', DATASET_FILTERS_MOCK],
    ]);
    expect(cacheSave).toHaveBeenCalled();
    expect(result).toEqual(SERVICE_RESULT);

    // Second call, testing the cached result
    (FileCache as jest.Mock).mockReset();
    (requestData as jest.Mock).mockReset();
    cacheGetKey.mockReset();
    cacheGetKey
      .mockReturnValueOnce(SERVICE_RESULT.content.features)
      .mockReturnValueOnce(SERVICE_RESULT.content.filters);

    const result2 = await fetchDataset(
      sessionID,
      datasetId,
      datasetConfig,
      params
    );
    expect(cacheGetKey.mock.calls).toEqual([['features'], ['filters']]);
    expect(FileCache).not.toHaveBeenCalled();
    expect(requestData).not.toHaveBeenCalled();
    expect(result2).toEqual(SERVICE_RESULT);
  });

  it('Should loadDatasetFeatures', async () => {
    (FileCache as jest.Mock).mockImplementation(mockFileCache);

    (requestData as jest.Mock)
      .mockResolvedValueOnce(DUMMY_DATA_RESPONSE)
      .mockResolvedValueOnce(DUMMY_DATA_RESPONSE2);

    (getDynamicDatasetFilters as jest.Mock).mockReturnValueOnce(
      DATASET_FILTER_CONFIG_MOCK
    );

    const multiResults = {
      features: [
        ...SERVICE_RESULT.content.features,
        ...SERVICE_RESULT2.content.features,
      ],
      filters: {
        'test-dataset': SERVICE_RESULT.content.filters,
      },
      errors: [],
    };

    (datasetApiResult as jest.Mock).mockReturnValueOnce(multiResults);

    (createDynamicFilterConfig as jest.Mock).mockReturnValueOnce(
      DATASET_FILTERS_MOCK
    );

    const result = await loadDatasetFeatures(sessionID, [
      [datasetId, datasetConfig],
      [datasetId2, datasetConfig2],
    ]);

    expect(datasetApiResult).toHaveBeenCalledWith([
      { ...SERVICE_RESULT, id: datasetId },
      { ...SERVICE_RESULT2, id: datasetId2 },
    ]);

    expect(result).toEqual(multiResults);
  });

  // it('Should loadPolylineFeatures', () => {});
  // it('Should loadFeatureDetail', () => {});
});
