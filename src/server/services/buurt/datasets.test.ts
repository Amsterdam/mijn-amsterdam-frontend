import { DatasetConfig, transformHardlooproutesResponse } from './datasets';

describe('Custom dataset tranformations', () => {
  it('Should group distance of hardlooproute', () => {
    const sourceResponse: any = {
      _embedded: {
        hardlooproute: [
          {
            id: 1,
            lengte: 2.6,
            geometry: { coordinates: [1, 2], type: 'Point' },
          },
          {
            id: 2,
            lengte: 5.5,
            geometry: { coordinates: [1, 2], type: 'Point' },
          },
          {
            id: 3,
            lengte: 9,
            geometry: { coordinates: [1, 2], type: 'Point' },
          },
          {
            id: 4,
            lengte: 11,
            geometry: { coordinates: [1, 2], type: 'Point' },
          },
        ],
      },
    };

    const transformedFeatures = [
      {
        geometry: { coordinates: [1, 2], type: 'Point' },
        properties: {
          lengte: '0-5 km',
          id: '1',
          datasetId: 'hardlooproute',
        },
        type: 'Feature',
      },
      {
        geometry: { coordinates: [1, 2], type: 'Point' },
        properties: {
          lengte: '0-5 km',
          id: '2',
          datasetId: 'hardlooproute',
        },
        type: 'Feature',
      },
      {
        geometry: { coordinates: [1, 2], type: 'Point' },
        properties: {
          lengte: '6-10 km',
          id: '3',
          datasetId: 'hardlooproute',
        },
        type: 'Feature',
      },
      {
        geometry: { coordinates: [1, 2], type: 'Point' },
        properties: {
          lengte: 'Meer dan 10 km',
          id: '4',
          datasetId: 'hardlooproute',
        },
        type: 'Feature',
      },
    ];

    const config: DatasetConfig = {
      featureType: 'Point',
      triesUntilConsiderdStale: 5,
    };

    const result = transformHardlooproutesResponse(
      'hardlooproute',
      config,
      sourceResponse
    );

    expect(result).toStrictEqual(transformedFeatures);
  });
});
