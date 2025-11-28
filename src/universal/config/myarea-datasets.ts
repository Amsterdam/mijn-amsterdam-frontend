import { featureToggle } from '../../client/components/MyArea/MyArea-thema-config';

// Amsterdam center
export const DEFAULT_LAT: number = 52.3676842478192;
export const DEFAULT_LNG: number = 4.90022569871861;
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
  excludeValues?: string[];
  title?: string;
  sort?: 'asc' | 'desc';
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

const excludeFractieOmschrijving = [];
const month = new Date().getMonth();
// Exlude Kerstboom in all months but December and January
const DECEMBER = 11;
const JANUARY = 0;
if (month !== DECEMBER && month !== JANUARY) {
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
            sort: 'asc',
            excludeValues: excludeFractieOmschrijving,
          },
          geadopteerd_ind: {
            title: 'Geadopteerd',
            sort: 'asc',
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
          gebiedsnaam: {
            sort: 'asc',
          },
        },
      },
      parkeerzones_uitzondering: {
        title: 'Uitzonderingen parkeervergunningen',
      },
    },
  },
  bekendmakingen: {
    isDisabled: !featureToggle.bekendmakingenDatasetActive,
    title: 'Vergunningen en ontheffingen',
    datasets: {
      bekendmakingen: {
        title: 'Vergunningen en ontheffingen',
        filters: {
          onderwerp: {
            title: 'Onderwerp',
            sort: 'asc',
          },
          categorie: {
            title: 'Categorie',
            sort: 'asc',
          },
        },
      },
    },
  },
  evenementen: {
    isDisabled: !featureToggle.evenementenDatasetActive,
    title: 'Evenementen',
    datasets: { evenementen: { title: 'Evenementen' } },
  },

  sport: {
    isDisabled: !featureToggle.sportDatasetsActive,
    title: 'Sport',
    datasets: {
      sportaanbieder: {
        title: 'Sporten',
        filters: {
          stadspasJeugd: {
            title: 'Stadspasvergoeding jeugd',
            sort: 'asc',
            valueConfig: {
              Null: { title: 'Onbekend' },
              False: { title: 'Nee' },
              True: { title: 'Ja' },
            },
          },
          aangepastSporten: {
            title: 'Aangepast sporten',
            sort: 'asc',
            valueConfig: {
              Null: { title: 'Onbekend' },
              False: { title: 'Nee' },
              True: { title: 'Ja' },
            },
          },
          typeSport: {
            title: 'Sport',
            sort: 'asc',
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
            sort: 'asc',
            valueConfig: {
              '': { title: 'Nee' },
            },
          },
          indicatieVoorzieningenMindervaliden: {
            title: 'Voorzieningen voor minder validen',
            sort: 'asc',
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
            sort: 'asc',
          },
          indicatieToegankelijkMindervaliden: {
            title: 'Toegankelijk voor minder validen',
            sort: 'asc',
            valueConfig: {
              '': { title: 'Nee' },
            },
          },
          indicatieVoorzieningenMindervaliden: {
            title: 'Voorzieningen voor minder validen',
            sort: 'asc',
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
            sort: 'asc',
            valueConfig: {
              Null: { title: 'Onbekend' },
            },
          },
          soortOndergrond: {
            title: 'Soort ondergrond',
            sort: 'asc',
            valueConfig: {
              '': { title: 'Onbekend' },
            },
          },
          soortLocatie: {
            title: 'Soort locatie',
            sort: 'asc',
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
            sort: 'asc',
          },
        },
      },
      sportpark: { title: 'Sportpark' },
      sportveld: {
        title: 'Sportveld',
        filters: {
          sportfunctie: {
            title: '',
            sort: 'asc',
            valueConfig: {
              Null: { title: 'Overig' },
            },
          },
          soortOndergrond: {
            title: 'Soort ondergrond',
            sort: 'asc',
            valueConfig: {
              Null: { title: 'Onbekend' },
            },
          },
        },
      },
    },
  },
  wior: {
    isDisabled: !featureToggle.wiorDatasetActive,
    title: 'Werk in de openbare ruimte (WIOR)',
    datasets: {
      wior: {
        title: 'Werk in de openbare ruimte (WIOR)',
        filters: {
          datumStartUitvoering: {
            title: 'Aanvang werkzaamheden',
            valueConfig: {
              Lopend: { title: 'Lopende werkzaamheden' },
              Binnenkort: { title: 'Binnen enkele maanden' },
              '0-1 jaar': { title: 'Binnen 1 jaar' },
              '1-3 jaar': { title: 'Over 1 tot 3 jaar' },
              '>3 jaar': { title: 'Over meer dan 3 jaar' },
              Onbekend: { title: 'Onbekend' },
            },
          },
          duur: {
            title: 'Duur',
          },
        },
      },
    },
  },
  meldingenBuurt: {
    isDisabled: !featureToggle.meldingenBuurtActive,
    title: 'Meldingen',
    datasets: {
      meldingenBuurt: {
        title: 'Meldingen',
        filters: {
          category: {
            title: 'Categorie',
            valueConfig: {
              Afval: {
                title: 'Afval en containers',
              },
              'Civiele-constructies': {
                title: 'Bruggen, kades, sluizen en oevers',
              },
              'Openbaar-groen-en-water': {
                title: 'Bomen, planten en water',
              },
              'Overlast-bedrijven-en-horeca': {
                title: 'Overlast bedrijven en Horeca',
              },
              'Overlast-in-de-openbare-ruimte': {
                title: 'Overlast in de openbare ruimte',
              },
              'Overlast-op-het-water': {
                title: 'Overlast van boten',
              },
              'Overlast-van-dieren': {
                title: 'Overlast van dieren',
              },
              Schoon: {
                title: 'Onderhoud straten, gladheid en graffiti',
              },
              'Wegen-verkeer-straatmeubilair': {
                title: 'Wegen, Verkeer en Straatmeubilair',
              },
              Overig: {
                title: 'Overig',
              },
            },
          },
        },
      },
    },
  },
  bedrijveninvesteringszones: {
    title: 'Bedrijveninvesteringszones',
    profileType: ['commercial'],
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
export const ACTIVE_DATASET_IDS_INITIAL = ['afvalcontainers'];

export const POLYLINE_GEOMETRY_TYPES: FeatureType[] = [
  'Polygon',
  'MultiPolygon',
  'MultiLineString',
];
