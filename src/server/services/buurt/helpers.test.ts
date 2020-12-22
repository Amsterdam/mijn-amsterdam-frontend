import { getApiEmbeddedResponse } from './helpers';

describe('Buurt helpers', () => {
  it('Should extract correct api response', () => {
    expect(
      getApiEmbeddedResponse('test', { _embedded: { test: 'api-result' } })
    ).toBe('api-result');
  });
  it('Should getDatasetEndpointConfig', () => {});
  it('Should recursiveCoordinateSwap', () => {});
  it('Should isCoordWithingBoundingBox', () => {});
  it('Should filterPolylineFeaturesWithinBoundingBox', () => {});
  it('Should filterPointFeaturesWithinBoundingBox', () => {});
  it('Should getDynamicDatasetFilters', () => {});
  it('Should createDynamicFilterConfig', () => {});
  it('Should filterDatasetFeatures', () => {});
  it('Should refineFilterSelection', () => {});
  it('Should filterAndRefineFeatures', () => {});
});
