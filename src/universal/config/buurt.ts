import { FeatureToggle } from './app';

// Amsterdam center
export const DEFAULT_LAT: number = 52.3717228;
export const DEFAULT_LNG: number = 4.8927377;
export const CITY_ZOOM = 8;
export const HOOD_ZOOM = 12;
export const LOCATION_ZOOM = 15;

export const MY_AREA_TRACKING_CATEGORY = 'Mijn buurt';

export type FeatureType =
  | 'Point'
  | 'Polygon'
  | 'MultiPolygon'
  | 'MultiLineString';
export type DatasetCategoryId = string;
export type DatasetId = string;
export type DatasetPropertyName = string;
export type DatasetPropertyValue = string;
export type DatasetPropertyValueWithCount = Record<
  DatasetPropertyValue,
  number
>;

export interface DatasetPropertyValueConfig {
  title?: string;
}

export interface DatasetProperty {
  values?: DatasetPropertyValueWithCount;
  valuesRefined?: DatasetPropertyValueWithCount;
  valueConfig?: Record<DatasetPropertyValue, DatasetPropertyValueConfig>; // The key of the valueConfig should always start with a cappital letter as the values are Capitalized on the BFF
  title?: string;
  excludeValues?: string[];
  transformValueLabel?: (value: any) => any;
}

export type DatasetPropertyFilter = Record<
  DatasetPropertyName,
  DatasetProperty
>;

export interface DatasetControl {
  title: string;
  profileType?: ProfileType[];
  filters?: DatasetPropertyFilter;
}

export type DatasetCategory = {
  isDisabled?: boolean;
  title: string;
  profileType?: ProfileType[];
  datasets: Record<DatasetId, DatasetControl>;
};
export type DatasetCategories = Record<DatasetCategoryId, DatasetCategory>;
export type DatasetFilterSelection = Record<DatasetId, DatasetPropertyFilter>;

const excludeFractieOmschrijving = ['Brood', 'brood'];
const month = new Date().getMonth();
// Exlude Kerstboom in all months but December and January
if (month !== 11 && month !== 0) {
  excludeFractieOmschrijving.push('Kerstboom');
}

export const DATASETS: DatasetCategories = {
  afvalcontainers: {
    title: 'Afvalcontainers',
    datasets: {
      afvalcontainers: {
        title: 'Afvalcontainers',
        filters: {
          fractie_omschrijving: {
            excludeValues: excludeFractieOmschrijving,
          },
          geadopteerd_ind: {
            title: 'Geadopteerd',
            valueConfig: {
              True: { title: 'Ja' },
              Undefined: { title: 'Nee' },
              Null: { title: 'Nee' },
              False: { title: 'Nee' },
            },
          },
        },
      },
    },
  },
  parkeren: {
    title: 'Parkeren',
    datasets: {
      parkeerzones: {
        title: 'Parkeervergunningen',
        filters: {
          gebiedsnaam: {},
        },
      },
      parkeerzones_uitzondering: {
        title: 'Uitzonderingen parkeervergunningen',
      },
    },
  },
  bekendmakingen: {
    title: 'Vergunningen',
    datasets: {
      bekendmakingen: {
        title: 'Vergunningen',
        filters: {
          onderwerp: {
            title: 'Onderwerp',
          },
          categorie: {
            title: 'Categorie',
          },
        },
      },
    },
  },
  evenementen: {
    title: 'Evenementen',
    datasets: { evenementen: { title: 'Evenementen' } },
  },
  sport: {
    isDisabled: !FeatureToggle.sportDatasetsActive,
    title: 'Sport',
    datasets: {
      sportaanbieder: {
        title: 'Sporten',
        filters: {
          indicatieStadspas: {
            title: 'Stadspasvergoeding jeugd',
            valueConfig: {
              '': { title: 'Nee' },
            },
          },
          indicatieAangepastSporten: {
            title: 'Aangepast sporten',
            valueConfig: {
              '': { title: 'Nee' },
            },
          },
          typeSport: {
            title: 'Sport',
          },
        },
      },
      zwembad: { title: 'Zwembaden' },
      sporthal: { title: 'Sporthal' },
      gymzaal: {
        title: 'Gymzaal',
        filters: {
          indicatieToegankelijkMindervaliden: {
            title: 'Toegankelijk voor minder validen',
            valueConfig: {
              '': { title: 'Nee' },
            },
          },
          indicatieVoorzieningenMindervaliden: {
            title: 'Voorzieningen voor minder validen',
            valueConfig: {
              '': { title: 'Nee' },
            },
          },
        },
      },
      sportzaal: {
        title: 'Sportzaal',
        filters: {
          type: {
            title: 'Type',
          },
          indicatieToegankelijkMindervaliden: {
            title: 'Toegankelijk voor minder validen',
            valueConfig: {
              '': { title: 'Nee' },
            },
          },
          indicatieVoorzieningenMindervaliden: {
            title: 'Voorzieningen voor minder validen',
            valueConfig: {
              '': { title: 'Nee' },
            },
          },
        },
      },
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
      hardlooproute: {
        title: 'Hardlooproutes',
        filters: {
          lengte: {
            title: 'Lengte',
          },
        },
      },
      sportpark: { title: 'Sportpark' },
      sportveld: {
        title: 'Sportveld',
        filters: {
          sportfunctie: {
            title: '',
            valueConfig: {
              Null: { title: 'Overig' },
            },
          },
          soortOndergrond: {
            title: 'Soort ondergrond',
            valueConfig: {
              Null: { title: 'Onbekend' },
            },
          },
        },
      },
    },
  },
  wior: {
    title: 'Werk in de openbare ruimte (WIOR)',
    datasets: {
      wior: {
        title: 'Werk in de openbare ruimte (WIOR)',
        filters: {
          indicatieKleinwerk: {
            title: 'Kleine klus',
            valueConfig: {
              Null: { title: 'Nee' },
              Yes: { title: 'Ja' },
            },
          },
        },
      },
    },
  },
  bedrijveninvesteringszones: {
    title: 'Bedrijveninvesteringszones',
    profileType: ['commercial', 'private-commercial'],
    datasets: {
      bedrijveninvesteringszones: {
        title: 'Bedrijveninvesteringszones',
      },
    },
  },
};

export function getDatasetCategoryId(datasetId: DatasetId) {
  const group = Object.entries(DATASETS).find(([categoryId, category]) =>
    Object.keys(category.datasets).includes(datasetId)
  );
  if (group) {
    return group[0];
  }
  return;
}

// TODO: add all dataset id's we want to load initially
export const ACTIVE_DATASET_IDS_INITIAL = [
  'afvalcontainers',
  'bekendmakingen',
  'evenementen',
];

export const POLYLINE_GEOMETRY_TYPES: FeatureType[] = [
  'Polygon',
  'MultiPolygon',
  'MultiLineString',
];
