import {
  DatasetFilterSelection,
  POLYLINE_GEOMETRY_TYPES,
} from '../../../universal/config';
import {
  apiSuccesResult,
  apiErrorResult,
} from '../../../universal/helpers/api';
import FileCache from '../../helpers/file-cache';
import { requestData } from '../../helpers/source-api-request';
import * as service from './buurt';
import {
  ACCEPT_CRS_4326,
  BUURT_CACHE_TTL_1_DAY_IN_MINUTES,
  DatasetConfig,
} from './datasets';
import {
  createDynamicFilterConfig,
  getDynamicDatasetFilters,
  datasetApiResult,
  filterPolylineFeaturesWithinBoundingBox,
  filterAndRefineFeatures,
  getDatasetEndpointConfig,
} from './helpers';

const DUMMY_DATA_RESPONSE = apiSuccesResult([
  { properties: { foo: 'bar', bar: undefined } },
  { properties: { foo: 'hop', bar: true } },
]);

const DUMMY_DATA_RESPONSE2 = apiSuccesResult([
  { properties: { hello: 'world', world: 'peace' } },
  { properties: { hello: 'you', world: 'equality' } },
]);

const DUMMY_DATA_RESPONSE_ERROR = apiErrorResult('not-found', null);

const DUMMY_DATA_DETAIL_RESPONSE = apiSuccesResult({
  id: 'test',
  foo: 'bar',
});

const sessionID = 'xxxx';
const datasetId = 'test-dataset';
const datasetId2 = 'test-dataset2';
const datasetId3 = 'test-dataset-error';

const datasetConfig: DatasetConfig = {
  listUrl: 'http://url.to/api/foo',
  detailUrl: 'http://url.to/api/detail/foo/',
  transformList: (r: any) => r,
  featureType: 'Point',
  cacheTimeMinutes: BUURT_CACHE_TTL_1_DAY_IN_MINUTES,
};

const datasetConfig2: DatasetConfig = {
  listUrl: 'http://url.to/api/hello',
  detailUrl: 'http://url.to/api/detail/hello/',
  transformList: (r: any) => r,
  featureType: 'Point',
  cacheTimeMinutes: BUURT_CACHE_TTL_1_DAY_IN_MINUTES,
};

const datasetConfig3: DatasetConfig = {
  listUrl: 'http://url.to/api/not-found',
  detailUrl: 'http://url.to/api/not-found/hello/',
  transformList: (r: any) => r,
  featureType: 'Point',
  cacheTimeMinutes: BUURT_CACHE_TTL_1_DAY_IN_MINUTES,
};

const params = {};

const DATASET_FILTER_CONFIG_MOCK = 'test';
const DATASET_FILTERS_MOCK = {
  foo: {
    values: {
      Bar: 1,
      Hop: 1,
    },
  },
  bar: {
    values: {
      Undefined: 1,
      True: 1,
    },
  },
};

const SERVICE_RESULT = apiSuccesResult({
  features: DUMMY_DATA_RESPONSE.content,
  filters: DATASET_FILTERS_MOCK,
});

const SERVICE_RESULT2 = apiSuccesResult({
  features: DUMMY_DATA_RESPONSE2.content,
});

const DATASET_RESULT_MULTI = {
  features: [
    ...SERVICE_RESULT.content.features,
    ...SERVICE_RESULT2.content.features,
  ],
  filters: {
    'test-dataset': SERVICE_RESULT.content.filters,
  },
  errors: [],
};
const DATASET_RESULT_MULTI_WITH_ERRORS = {
  ...DATASET_RESULT_MULTI,
  errors: [
    {
      id: 'test-dataset-error',
      message: 'not-found',
    },
  ],
};

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
  it('Should fetchDataset, cache and return cached dataset on future invocations', async () => {
    (FileCache as jest.Mock).mockImplementation(mockFileCache);
    (requestData as jest.Mock).mockResolvedValue(DUMMY_DATA_RESPONSE);
    (getDynamicDatasetFilters as jest.Mock).mockReturnValue(
      DATASET_FILTER_CONFIG_MOCK
    );
    (createDynamicFilterConfig as jest.Mock).mockReturnValue(
      DATASET_FILTERS_MOCK
    );

    // First call fetches data from source api
    const result = await service.fetchDataset(
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
      datasetId,
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

    const result2 = await service.fetchDataset(
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
      .mockResolvedValueOnce(DUMMY_DATA_RESPONSE2)
      .mockResolvedValueOnce(DUMMY_DATA_RESPONSE_ERROR);

    // Only for the first dataset
    (getDynamicDatasetFilters as jest.Mock).mockReturnValueOnce(
      DATASET_FILTER_CONFIG_MOCK
    );

    (datasetApiResult as jest.Mock).mockReturnValueOnce(
      DATASET_RESULT_MULTI_WITH_ERRORS
    );

    (createDynamicFilterConfig as jest.Mock).mockReturnValueOnce(
      DATASET_FILTERS_MOCK
    );

    const result = await service.loadDatasetFeatures(sessionID, [
      [datasetId, datasetConfig],
      [datasetId2, datasetConfig2],
      [datasetId3, datasetConfig3],
    ]);

    expect(datasetApiResult).toHaveBeenCalledWith([
      { ...SERVICE_RESULT, id: datasetId },
      { ...SERVICE_RESULT2, id: datasetId2 },
      { ...DUMMY_DATA_RESPONSE_ERROR, id: datasetId3 },
    ]);

    expect(result).toEqual(DATASET_RESULT_MULTI_WITH_ERRORS);
  });

  it('Should loadPolylineFeatures', async () => {
    (FileCache as jest.Mock).mockImplementation(mockFileCache);
    (requestData as jest.Mock)
      .mockResolvedValueOnce(DUMMY_DATA_RESPONSE)
      .mockResolvedValueOnce(DUMMY_DATA_RESPONSE2);
    (getDynamicDatasetFilters as jest.Mock)
      .mockReturnValueOnce(DATASET_FILTER_CONFIG_MOCK)
      .mockReturnValueOnce(null);
    (createDynamicFilterConfig as jest.Mock).mockReturnValue(
      DATASET_FILTERS_MOCK
    );

    (getDatasetEndpointConfig as jest.Mock).mockReturnValueOnce([
      [datasetId, datasetConfig],
      [datasetId2, datasetConfig2],
    ]);

    (datasetApiResult as jest.Mock).mockReturnValueOnce(DATASET_RESULT_MULTI);

    (filterPolylineFeaturesWithinBoundingBox as jest.Mock).mockReturnValueOnce(
      DATASET_RESULT_MULTI.features
    );

    (filterAndRefineFeatures as jest.Mock).mockReturnValueOnce(
      DATASET_RESULT_MULTI
    );

    const filterSelection = { 'test-dataset': DATASET_FILTERS_MOCK };

    const requestParams: {
      datasetIds: string[];
      bbox: [number, number, number, number];
      filters: DatasetFilterSelection;
    } = {
      bbox: [1, 2, 3, 4],
      datasetIds: [datasetId, datasetId2],
      filters: filterSelection,
    };

    const result = await service.loadPolylineFeatures(sessionID, requestParams);

    expect(getDatasetEndpointConfig).toHaveBeenCalledWith(
      [datasetId, datasetId2],
      POLYLINE_GEOMETRY_TYPES
    );
    // Instead of expect(fetchDataset).toHaveBeenCalledTimes(2) because mocking that function from the same module is not straightforward
    expect(requestData).toHaveBeenCalledTimes(2);

    expect(datasetApiResult).toHaveBeenCalledWith([
      { ...SERVICE_RESULT, id: datasetId },
      { ...SERVICE_RESULT2, id: datasetId2 },
    ]);

    // We're not actually filtering the features here for testing purposes.
    expect(filterPolylineFeaturesWithinBoundingBox).toHaveBeenCalledWith(
      DATASET_RESULT_MULTI.features,
      requestParams.bbox
    );

    // We're not actually refining the filter selection here for testing purposes.
    expect(filterAndRefineFeatures).toHaveBeenCalledWith(
      DATASET_RESULT_MULTI.features,
      [datasetId, datasetId2],
      filterSelection,
      filterSelection
    );

    expect(result).toEqual(DATASET_RESULT_MULTI);
  });

  it('Should loadFeatureDetail', async () => {
    (getDatasetEndpointConfig as jest.Mock).mockReturnValueOnce([
      [datasetId, datasetConfig],
    ]);

    (requestData as jest.Mock).mockResolvedValueOnce(
      DUMMY_DATA_DETAIL_RESPONSE
    );

    const detailItemId = 'x';
    const result = await service.loadFeatureDetail(
      sessionID,
      datasetId,
      detailItemId
    );
    const requestConfig = {
      url: datasetConfig.detailUrl + detailItemId,
      cacheTimeout: 0,
      headers: ACCEPT_CRS_4326,
    };
    expect(requestData).toHaveBeenCalledWith(requestConfig, sessionID, {});
    expect(result).toEqual(DUMMY_DATA_DETAIL_RESPONSE);
  });

  it('Should fail to loadFeatureDetail', async () => {
    (getDatasetEndpointConfig as jest.Mock).mockReturnValueOnce([]);
    const detailItemId = 'x';
    const result = await service.loadFeatureDetail(
      sessionID,
      datasetId,
      detailItemId
    );

    expect(result).toEqual(
      apiErrorResult(`Unknown dataset ${datasetId}`, null)
    );
  });
});
