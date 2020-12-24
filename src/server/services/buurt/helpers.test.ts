import * as config from '../../../universal/config/buurt';
import { datasetEndpoints } from './datasets';
import {
  createDynamicFilterConfig,
  createFeaturePropertiesFromPropertyFilterConfig,
  filterAndRefineFeatures,
  filterDatasetFeatures,
  filterPointFeaturesWithinBoundingBox,
  filterPolylineFeaturesWithinBoundingBox,
  getApiEmbeddedResponse,
  getDatasetEndpointConfig,
  getDynamicDatasetFilters,
  getPropertyFilters,
  isCoordWithingBoundingBox,
  recursiveCoordinateSwap,
  refineFilterSelection,
} from './helpers';

const OPENBARESPORTPLEK1 = {
  geometry: { coordinates: [15, 15] },
  properties: {
    sportvoorziening: 'Sportvoorziening1',
    soortOndergrond: 'SoortOndergrond1',
    datasetId: 'openbaresportplek',
  },
};
const OPENBARESPORTPLEK2 = {
  geometry: { coordinates: [25, 25] },
  properties: {
    sportvoorziening: 'Sportvoorziening2',
    soortOndergrond: 'SoortOndergrond2',
    datasetId: 'openbaresportplek',
  },
};
const OPENBARESPORTPLEK3 = {
  geometry: { coordinates: [15, 15] },
  properties: {
    sportvoorziening: 'Sportvoorziening3',
    soortOndergrond: 'SoortOndergrond3',
    datasetId: 'openbaresportplek',
  },
};
const OPENBARESPORTPLEK4 = {
  geometry: { coordinates: [25, 25] },
  properties: {
    sportvoorziening: 'Sportvoorziening2',
    soortOndergrond: 'SoortOndergrond2',
    datasetId: 'openbaresportplek',
  },
};
const PARKEERZONE1 = {
  geometry: { coordinates: [20, 20] },
  properties: {
    datasetId: 'parkeerzones',
    gebiedsnaam: 'West',
  },
};
const BEKENDMAKING1 = {
  geometry: { coordinates: [20, 20] },
  properties: {
    datasetId: 'bekendmakingen',
  },
};
const features: any = [
  OPENBARESPORTPLEK1,
  OPENBARESPORTPLEK2,
  OPENBARESPORTPLEK3,
  OPENBARESPORTPLEK4,
  PARKEERZONE1,
  BEKENDMAKING1,
];

describe('Buurt helpers', () => {
  let ORIGINAL_DATASETS = config.DATASETS;
  let DATASETS: any = null;

  beforeAll(() => {
    DATASETS = (config.DATASETS as any) = {
      sport: {
        datasets: {
          openbaresportplek: {
            title: 'Openbare sportplek',
            filters: {
              sportvoorziening: {
                // title: 'Sportvoorziening',
                valueConfig: {
                  Null: { title: 'Onbekend' },
                },
              },
              soortOndergrond: {
                title: 'Soort ondergrond',
                valueConfig: {
                  '': { title: 'Onbekend' },
                },
              },
              soortLocatie: {
                title: 'Soort locatie',
                valueConfig: {
                  '': { title: 'Onbekend' },
                },
              },
            },
          },
        },
      },
    };
  });

  afterAll(() => {
    (config.DATASETS as any) = ORIGINAL_DATASETS;
  });

  it('Should extract correct api response', () => {
    const result = ['api-result'];
    expect(
      getApiEmbeddedResponse('test', { _embedded: { test: result } })
    ).toBe(result);

    const result2 = 'bliep';
    expect(
      getApiEmbeddedResponse('test', { _embedded: { test: result2 } })
    ).toBe(null);
  });

  it('Should getDatasetEndpointConfig', () => {
    expect(getDatasetEndpointConfig(['openbaresportplek'])).toStrictEqual([
      ['openbaresportplek', datasetEndpoints.openbaresportplek],
    ]);

    expect(
      getDatasetEndpointConfig(
        ['openbaresportplek', 'sportveld'],
        ['MultiPolygon']
      )
    ).toStrictEqual([['sportveld', datasetEndpoints.sportveld]]);
  });

  it('Should recursiveCoordinateSwap', () => {
    const X = 1;
    const Y = 2;
    const X2 = 10;
    const Y2 = 20;

    expect(
      recursiveCoordinateSwap([
        [
          [X, Y],
          [X2, Y2],
        ],
      ])
    ).toStrictEqual([
      [
        [Y, X],
        [Y2, X2],
      ],
    ]);
  });

  it('Should isCoordWithingBoundingBox', () => {
    expect(isCoordWithingBoundingBox([10, 10, 20, 20], [15, 15])).toBe(true);
    expect(isCoordWithingBoundingBox([10, 10, 20, 20], [5, 33])).toBe(false);
  });

  it('Should filterPolylineFeaturesWithinBoundingBox', () => {
    const features: any = [
      {
        geometry: { coordinates: [[15, 15]] },
      },
      {
        geometry: { coordinates: [[25, 25]] },
      },
    ];
    expect(
      filterPolylineFeaturesWithinBoundingBox(features, [10, 10, 20, 20]).length
    ).toBe(1);
    const features2: any = [
      {
        geometry: { coordinates: [[[[15, 15]]]] },
      },
      {
        geometry: { coordinates: [[[25, 25]]] },
      },
    ];
    expect(
      filterPolylineFeaturesWithinBoundingBox(features2, [10, 10, 20, 20])
        .length
    ).toBe(1);
  });

  it('Should filterPointFeaturesWithinBoundingBox', () => {
    const features: any = [
      {
        geometry: { coordinates: [15, 15] },
      },
      {
        geometry: { coordinates: [25, 25] },
      },
    ];
    expect(
      filterPointFeaturesWithinBoundingBox(features, [10, 10, 20, 20]).length
    ).toBe(1);
  });

  it('Should getDynamicDatasetFilters', () => {
    expect(getDynamicDatasetFilters('openbaresportplek')).toStrictEqual(
      DATASETS.sport.datasets.openbaresportplek.filters
    );
  });

  it('Should createDynamicFilterConfig', () => {
    const filterConfig = {
      sportvoorziening: {
        // title: 'Sportvoorziening',
        valueConfig: {
          Null: { title: 'Onbekend' },
        },
      },
      soortOndergrond: {
        title: 'Soort ondergrond',
        valueConfig: {
          '': { title: 'Onbekend' },
        },
      },
    };

    const dynamicFilterConfig = {
      soortOndergrond: {
        values: {
          SoortOndergrond1: 1,
          SoortOndergrond2: 2,
          SoortOndergrond3: 1,
        },
      },
      sportvoorziening: {
        values: {
          Sportvoorziening1: 1,
          Sportvoorziening2: 2,
          Sportvoorziening3: 1,
        },
      },
    };
    expect(createDynamicFilterConfig(features, filterConfig)).toStrictEqual(
      dynamicFilterConfig
    );
  });

  it('Should filterDatasetFeatures, filter the right features with only datasetid', () => {
    expect(
      filterDatasetFeatures(features, ['parkeerzones'], {})
    ).toStrictEqual([PARKEERZONE1]);
  });

  it('Should filterDatasetFeatures, filter the right features with datasetid and 1 filter', () => {
    expect(
      filterDatasetFeatures(features, ['openbaresportplek'], {
        openbaresportplek: {
          soortOndergrond: { values: { SoortOndergrond2: 1 } },
        },
      }).length
    ).toBe(2);
  });

  it('Should filterDatasetFeatures, filter the right features with datasetid and multiple filters', () => {
    expect(
      filterDatasetFeatures(features, ['openbaresportplek'], {
        openbaresportplek: {
          soortOndergrond: {
            values: { SoortOndergrond2: 1, SoortOndergrond1: 1 },
          },
        },
      }).length
    ).toBe(3);
  });

  it('Should filterDatasetFeatures, filter the right features with multiple datasetids and multiple filters', () => {
    expect(
      filterDatasetFeatures(features, ['openbaresportplek', 'parkeerzones'], {
        openbaresportplek: {
          soortOndergrond: {
            values: { SoortOndergrond3: 1 },
          },
        },
      }).length
    ).toBe(2);
  });

  it('Should filterDatasetFeatures, filter the right features with multiple datasetids but no matching filters', () => {
    expect(
      filterDatasetFeatures(features, ['openbaresportplek', 'parkeerzones'], {
        openbaresportplek: {
          foo: {
            values: { bar: 1 },
          },
        },
        parkeerzones: {
          bliep: {
            values: { sblap: 1 },
          },
        },
      }).length
    ).toBe(0);
  });

  it('Should refineFilterSelection', () => {
    const featuresPartial = features.filter(
      (feature: any) =>
        feature.properties.soortOndergrond !== 'SoortOndergrond2'
    );
    expect(
      refineFilterSelection(featuresPartial, {
        openbaresportplek: {
          soortOndergrond: {
            values: {
              SoortOndergrond3: 1,
              SoortOndergrond2: 2,
              SoortOndergrond1: 1,
            },
          },
        },
      })
    ).toStrictEqual({
      openbaresportplek: {
        soortOndergrond: {
          values: {
            SoortOndergrond1: 1,
            SoortOndergrond2: 2,
            SoortOndergrond3: 1,
          },
          valuesRefined: { SoortOndergrond1: 1, SoortOndergrond3: 1 },
        },
      },
    });
  });

  it('Should filterAndRefineFeatures', () => {
    const filterSelection = {
      openbaresportplek: {
        soortOndergrond: {
          values: { SoortOndergrond3: 1 },
        },
      },
    };
    const filtersBase = {
      openbaresportplek: {
        soortOndergrond: {
          values: {
            SoortOndergrond3: 1,
            SoortOndergrond2: 2,
            SoortOndergrond1: 1,
          },
        },
      },
      parkeerzones: {
        gebiedsnaam: {
          values: {
            West: 1,
          },
        },
      },
    };

    const datasetIds = ['openbaresportplek', 'parkeerzones'];

    const result = {
      features: [OPENBARESPORTPLEK3, PARKEERZONE1],
      filters: {
        openbaresportplek: {
          soortOndergrond: {
            values: {
              SoortOndergrond1: 1,
              SoortOndergrond2: 2,
              SoortOndergrond3: 1,
            },
            valuesRefined: {
              SoortOndergrond3: 1,
            },
          },
        },
        parkeerzones: {
          gebiedsnaam: {
            values: {
              West: 1,
            },
            valuesRefined: {
              West: 1,
            },
          },
        },
      },
    };

    expect(
      filterAndRefineFeatures(
        features,
        datasetIds,
        filterSelection,
        filtersBase
      )
    ).toStrictEqual(result);
  });

  it('Should getPropertyFilters', () => {
    expect(getPropertyFilters('openbaresportplek')).toStrictEqual(
      DATASETS.sport.datasets.openbaresportplek.filters
    );
  });

  it('Should createFeaturePropertiesFromPropertyFilterConfig', () => {
    const targetFeatureProperties = {
      id: 'test',
      datasetId: 'openbaresportplek',
    };

    const sourceFeature = {
      properties: {
        soortOndergrond: 'soortOndergrond1',
        sportvoorziening: 'sportvoorziening1',
        foo: 'bar',
        hello: 'world',
      },
    };

    const transformedFeatureProperties = {
      ...targetFeatureProperties,
      soortOndergrond: 'SoortOndergrond1',
      sportvoorziening: 'Sportvoorziening1',
      soortLocatie: 'Undefined',
    };

    expect(
      createFeaturePropertiesFromPropertyFilterConfig(
        'openbaresportplek',
        targetFeatureProperties,
        sourceFeature
      )
    ).toStrictEqual(transformedFeatureProperties);
  });
});
