import { Mock, afterEach, describe, expect, it, vi } from 'vitest';

import * as service from './buurt.ts';
import {
  ACCEPT_CRS_4326,
  BUURT_CACHE_TTL_1_DAY_IN_MINUTES,
  DEFAULT_TRIES_UNTIL_CONSIDERED_STALE,
  DatasetConfig,
  DatasetFeatureProperties,
  DatasetFeatures,
} from './datasets.ts';
import {
  createDynamicFilterConfig,
  datasetApiResult,
  filterAndRefineFeatures,
  filterPolylineFeaturesWithinBoundingBox,
  getDatasetEndpointConfig,
  getDynamicDatasetFilters,
} from './helpers.ts';
import {
  DatasetFilterSelection,
  POLYLINE_GEOMETRY_TYPES,
} from '../../../universal/config/myarea-datasets.ts';
import {
  apiErrorResult,
  apiSuccessResult,
} from '../../../universal/helpers/api.ts';
import { jsonCopy, omit } from '../../../universal/helpers/utils.ts';
import FileCache from '../../helpers/file-cache.ts';
import { requestData } from '../../helpers/source-api-request.ts';

const DUMMY_DATA_RESPONSE = apiSuccessResult([
  { properties: { foo: 'bar', bar: undefined } },
  { properties: { foo: 'hop', bar: true } },
]);

const DUMMY_DATA_RESPONSE2 = apiSuccessResult([
  { properties: { hello: 'world', world: 'peace' } },
  { properties: { hello: 'you', world: 'equality' } },
]);

const DUMMY_DATA_RESPONSE_ERROR = apiErrorResult('not-found', null);

const DUMMY_DATA_DETAIL_RESPONSE = apiSuccessResult({
  id: 'test',
  foo: 'bar',
});

const datasetId = 'test-dataset';
const datasetId2 = 'test-dataset2';
const datasetId3 = 'test-dataset-error';

const datasetConfig: DatasetConfig = {
  listUrl: 'http://url.to/api/foo',
  detailUrl: 'http://url.to/api/detail/foo/',
  transformList: (r: unknown) => r as DatasetFeatures<DatasetFeatureProperties>,
  featureType: 'Point',
  cacheTimeMinutes: BUURT_CACHE_TTL_1_DAY_IN_MINUTES,
  triesUntilConsiderdStale: 5,
};

const datasetConfig2: DatasetConfig = {
  listUrl: 'http://url.to/api/hello',
  detailUrl: 'http://url.to/api/detail/hello/',
  transformList: (r: unknown) => r as DatasetFeatures<DatasetFeatureProperties>,
  featureType: 'Point',
  cacheTimeMinutes: BUURT_CACHE_TTL_1_DAY_IN_MINUTES,
  triesUntilConsiderdStale: 5,
};

const datasetConfig3: DatasetConfig = {
  listUrl: 'http://url.to/api/not-found',
  detailUrl: 'http://url.to/api/not-found/hello/',
  transformList: (r: unknown) => r as DatasetFeatures<DatasetFeatureProperties>,
  featureType: 'Point',
  cacheTimeMinutes: BUURT_CACHE_TTL_1_DAY_IN_MINUTES,
  triesUntilConsiderdStale: 5,
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

const SERVICE_RESULT = apiSuccessResult({
  features: DUMMY_DATA_RESPONSE.content,
  filters: DATASET_FILTERS_MOCK,
});

const SERVICE_RESULT2 = apiSuccessResult({
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

vi.mock('./helpers');
vi.mock('../../helpers/source-api-request');
vi.mock('../../helpers/file-cache');
vi.mock('../../../universal/config/env', () => {
  return {
    IS_AP: true,
    IS_OT: false,
    IS_PRODUCTION: false,
    IS_DEVELOPMENT: false,
    IS_ACCEPTANCE: true,
    IS_TAP: true,
    IS_TEST: true,
  };
});
vi.mock('../../../universal/config/myarea-datasets');

const cacheGetKey = vi.fn();
const cacheSetKey = vi.fn();
const cacheSave = vi.fn();
const cacheIsStale = vi.fn();

function mockFileCache() {
  return {
    getKey: cacheGetKey,
    setKey: cacheSetKey,
    save: cacheSave,
    isStale: cacheIsStale,
  };
}

describe('Buurt services', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  afterAll(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('Should fetchDataset, cache and return cached dataset on future invocations', async () => {
    (FileCache as Mock).mockImplementationOnce(mockFileCache);
    (requestData as Mock).mockResolvedValue(DUMMY_DATA_RESPONSE);
    (getDynamicDatasetFilters as Mock).mockReturnValue(
      DATASET_FILTER_CONFIG_MOCK
    );
    (createDynamicFilterConfig as Mock).mockReturnValue(DATASET_FILTERS_MOCK);

    // First call fetches data from source api
    const result = await service.fetchDataset(datasetId, datasetConfig, params);

    expect(cacheGetKey).toHaveBeenCalled();
    expect(FileCache).toHaveBeenCalledWith({
      name: datasetId,
      cacheTimeMinutes: BUURT_CACHE_TTL_1_DAY_IN_MINUTES,
      triesUntilConsiderdStale: DEFAULT_TRIES_UNTIL_CONSIDERED_STALE,
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
    (FileCache as Mock).mockReset();
    (requestData as Mock).mockReset();
    cacheGetKey.mockReset();
    cacheGetKey
      .mockReturnValueOnce(SERVICE_RESULT.content.features)
      .mockReturnValueOnce(SERVICE_RESULT.content.filters);

    const result2 = await service.fetchDataset(
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
    (FileCache as Mock).mockImplementationOnce(mockFileCache);
    (requestData as Mock)
      .mockResolvedValueOnce(DUMMY_DATA_RESPONSE)
      .mockResolvedValueOnce(DUMMY_DATA_RESPONSE2)
      .mockResolvedValueOnce(DUMMY_DATA_RESPONSE_ERROR);

    // Only for the first dataset
    (getDynamicDatasetFilters as Mock).mockReturnValueOnce(
      DATASET_FILTER_CONFIG_MOCK
    );

    (datasetApiResult as Mock).mockReturnValueOnce(
      DATASET_RESULT_MULTI_WITH_ERRORS
    );

    (createDynamicFilterConfig as Mock).mockReturnValueOnce(
      DATASET_FILTERS_MOCK
    );

    const result = await service.loadDatasetFeatures([
      [datasetId, datasetConfig],
      [datasetId2, datasetConfig2],
      [datasetId3, datasetConfig3],
    ]);

    const argumentsCalled = [
      { ...SERVICE_RESULT, id: datasetId },
      { ...SERVICE_RESULT2, id: datasetId2 },
      { ...DUMMY_DATA_RESPONSE_ERROR, id: datasetId3 },
    ];

    expect(datasetApiResult).toHaveBeenCalledWith(argumentsCalled);

    expect(result).toEqual(DATASET_RESULT_MULTI_WITH_ERRORS);
  });

  it('Should loadPolylineFeatures', async () => {
    (FileCache as Mock).mockImplementationOnce(mockFileCache);
    (requestData as Mock)
      .mockResolvedValueOnce(DUMMY_DATA_RESPONSE)
      .mockResolvedValueOnce(DUMMY_DATA_RESPONSE2);
    (getDynamicDatasetFilters as Mock)
      .mockReturnValueOnce(DATASET_FILTER_CONFIG_MOCK)
      .mockReturnValueOnce(null);
    (createDynamicFilterConfig as Mock).mockReturnValue(DATASET_FILTERS_MOCK);

    (getDatasetEndpointConfig as Mock).mockReturnValueOnce([
      [datasetId, datasetConfig],
      [datasetId2, datasetConfig2],
    ]);

    (datasetApiResult as Mock).mockReturnValueOnce(DATASET_RESULT_MULTI);

    (filterPolylineFeaturesWithinBoundingBox as Mock).mockReturnValueOnce(
      DATASET_RESULT_MULTI.features
    );

    (filterAndRefineFeatures as Mock).mockReturnValueOnce(DATASET_RESULT_MULTI);

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

    const result = await service.loadPolylineFeatures(requestParams);

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
    (getDatasetEndpointConfig as Mock).mockReturnValueOnce([
      [datasetId, datasetConfig],
    ]);

    (requestData as Mock).mockResolvedValueOnce(DUMMY_DATA_DETAIL_RESPONSE);

    const detailItemId = 'x-detail';

    const result = await service.loadFeatureDetail(datasetId, detailItemId);

    const requestConfig = {
      url: datasetConfig.detailUrl + detailItemId,
      cacheTimeout: 0,
      headers: ACCEPT_CRS_4326,
    };

    expect(requestData).toHaveBeenCalledWith(requestConfig);
    expect(result).toEqual(DUMMY_DATA_DETAIL_RESPONSE);
  });

  it('Should fail to loadFeatureDetail because no url or transformer found', async () => {
    const datasetConfig2 = omit(jsonCopy(datasetConfig), ['detailUrl']);

    (getDatasetEndpointConfig as Mock).mockReturnValueOnce([
      [datasetId, datasetConfig2],
    ]);

    const detailItemId = 'x';
    const result = await service.loadFeatureDetail(datasetId, detailItemId);

    expect(result).toEqual(
      apiErrorResult(
        `No url or transformer found for dataset ${datasetId} and detail ${detailItemId}`,
        null
      )
    );
  });

  (FileCache as Mock).mockImplementationOnce(mockFileCache);
  it('Should loadFeatureDetail from cached dataset', async () => {
    const features = ['foo', 'bar'];

    cacheGetKey.mockReturnValueOnce(jsonCopy(features));

    const datasetConfig2 = omit(jsonCopy(datasetConfig), ['detailUrl']);
    const detailItemId = 'x-detail';

    datasetConfig2.transformDetail = (
      responseData: unknown,
      options: DatasetFeatureProperties
    ) => {
      const cachedFeatures = (options.datasetCache as FileCache).getKey<
        string[]
      >('features');
      expect(responseData).toBe(null);
      expect(options.id).toBe(detailItemId);
      expect(options.datasetId).toBe(datasetId);
      expect(cachedFeatures).toStrictEqual(features);
      return cachedFeatures?.[0];
    };

    (getDatasetEndpointConfig as Mock).mockReturnValueOnce([
      [datasetId, datasetConfig2],
    ]);

    (requestData as Mock).mockResolvedValueOnce(DUMMY_DATA_DETAIL_RESPONSE);

    const result = await service.loadFeatureDetail(datasetId, detailItemId);

    expect(result).toStrictEqual({
      status: 'OK',
      content: 'foo',
    });

    expect(requestData).not.toHaveBeenCalled();
  });

  it('Should fail to loadFeatureDetail', async () => {
    (getDatasetEndpointConfig as Mock).mockReturnValueOnce([]);

    const detailItemId = 'x';
    const result = await service.loadFeatureDetail(datasetId, detailItemId);

    expect(result).toEqual(
      apiErrorResult(
        `No DatasetConfig found for dataset with id ${datasetId}`,
        null
      )
    );
  });
});
