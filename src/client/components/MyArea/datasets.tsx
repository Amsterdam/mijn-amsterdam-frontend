import { themeSpacing } from '@amsterdam/asc-ui';
import themeColors from '@amsterdam/asc-ui/es/theme/default/colors';
import { PolylineOptions } from 'leaflet';
import React, { ReactElement, ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import styled from 'styled-components';
import { DATASETS } from '../../../universal/config';
import { FeatureToggle } from '../../../universal/config/app';
import { getDatasetGroupId } from '../../../universal/config/buurt';
import { capitalizeFirstLetter } from '../../../universal/helpers';
import {
  MapIconAfvalGft,
  MapIconAfvalGlas,
  MapIconAfvalPapier,
  MapIconAfvalPlastic,
  MapIconAfvalRest,
  MapIconAfvalTextiel,
  MapIconBekendmaking,
  MapIconEvenement,
  MapIconSport,
} from '../../assets/icons';
import { DEFAULT_POLYLINE_OPTIONS } from './MyAreaPolyLineLayer';

export interface DatasetControlItem {
  id: string;
  title: string;
  collection: DatasetControlItem[];
  type?: 'filters' | 'category' | 'dataset' | 'filter';
}

const DatasetIcon = styled.div`
  margin-right: ${themeSpacing(2)};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
  width: 32px;
  height: 32px;
`;

const DatasetIconCircle = styled(DatasetIcon)`
  width: 16px;
  height: 16px;
`;

// const DatasetIconSquare = styled(DatasetIconCircle)`
//   border-radius: 0;
// `;

// const DatasetIconTriangle = styled(DatasetIconSquare)`
//   width: 0;
//   height: 0;
//   border-style: solid;
//   border-width: 0 10px 20px 10px;
//   border-color: transparent transparent #ffffff;
//   position: relative;

//   &:before {
//     content: '';
//     width: 100%;
//     height: 100%;
//     position: absolute;
//     bottom: -18px;
//     left: -7px;
//     border-style: solid;
//     border-width: 0 7px 14px 7px;
//     border-color: transparent transparent ${(props) => props.color};
//   }
// `;

const datasetIcons: Record<string, ReactElement<any>> = {
  rest: (
    <DatasetIcon style={{ backgroundColor: themeColors.tint.level6 }}>
      <MapIconAfvalRest fill={themeColors.tint.level1} />
    </DatasetIcon>
  ),
  papier: (
    <DatasetIcon style={{ backgroundColor: themeColors.supplement.lightblue }}>
      <MapIconAfvalPapier fill={themeColors.tint.level1} />
    </DatasetIcon>
  ),
  glas: (
    <DatasetIcon style={{ backgroundColor: themeColors.supplement.yellow }}>
      <MapIconAfvalGlas />
    </DatasetIcon>
  ),
  textiel: (
    <DatasetIcon style={{ backgroundColor: themeColors.tint.level6 }}>
      <MapIconAfvalTextiel fill={themeColors.tint.level1} />
    </DatasetIcon>
  ),
  gft: (
    <DatasetIcon style={{ backgroundColor: themeColors.support.valid }}>
      <MapIconAfvalGft fill={themeColors.tint.level1} />
    </DatasetIcon>
  ),
  plastic: (
    <DatasetIcon style={{ backgroundColor: themeColors.supplement.orange }}>
      <MapIconAfvalPlastic />
    </DatasetIcon>
  ),
  evenementen: (
    <DatasetIcon style={{ backgroundColor: themeColors.supplement.purple }}>
      <MapIconEvenement fill={themeColors.tint.level1} />
    </DatasetIcon>
  ),
  bekendmakingen: (
    <DatasetIcon style={{ backgroundColor: themeColors.support.valid }}>
      <MapIconBekendmaking fill={themeColors.tint.level1} />
    </DatasetIcon>
  ),
  sport: (
    <DatasetIcon style={{ backgroundColor: themeColors.support.valid }}>
      <MapIconSport fill={themeColors.tint.level1} />
    </DatasetIcon>
  ),
  default: (
    <DatasetIconCircle style={{ backgroundColor: themeColors.support.valid }} />
  ),
};

const datasetIconHtml = Object.fromEntries(
  Object.entries(datasetIcons).map(([datasetId, icon]) => {
    return [datasetId, renderToStaticMarkup(icon)];
  })
);

export function getIconHtml(datasetId: string) {
  return (
    datasetIconHtml[datasetId] ||
    datasetIconHtml[getDatasetGroupId(datasetId)] ||
    datasetIconHtml.default
  );
}

export function titleTransform(id: string) {
  return capitalizeFirstLetter(id).replace(/_/g, ' ');
}

const createDatasetControl = ({
  id,
  title,
  collection,
  type = 'category',
}: DatasetControlItem) => {
  return {
    id,
    title,
    collection,
    type,
  };
};

type PropertyName = string;

interface DatasetFilterConfig {
  [datasetId: string]: boolean | PropertyName[];
}

export const DATASETS_FILTERED: Record<string, DatasetFilterConfig> = {
  openbaresportplek: {
    sportfunctie: [
      'Honkbal/softbal',
      'Voetbal',
      'Atletiek',
      'Australian football',
      'Rugby',
      'Handboogschieten',
      'Golf driving range',
      'Short golf',
      'Cricket',
      'Hockey',
      'Tennis',
      'Golf',
      'Balspel',
      'Honkbal',
      'Handbal',
      'Korfbal',
      'Beachvolleybal',
      'Jeu de Boules',
      'Beachhandbal',
      'Basketbal',
      'Skaten',
      'Wielrennen',
      'Padel',
      'American football',
    ],
  },
};

const DATASET_CONTROL_ITEMS: DatasetControlItem[] = Object.entries(
  DATASETS
).map(([id, datasetIds]) => {
  return createDatasetControl({
    id,
    type: 'category',
    title: id,
    collection: datasetIds.map((id) => {
      const datasetFilters = DATASETS_FILTERED[id];
      return createDatasetControl({
        id,
        title: id,
        type: 'dataset',
        collection: datasetFilters
          ? Object.entries(datasetFilters)
              .filter(([id, propertyNames]) => Array.isArray(propertyNames))
              .map(([id, propertyNames]) => {
                const filterCollection = (propertyNames as PropertyName[]).map(
                  (id) =>
                    createDatasetControl({
                      id,
                      type: 'filter',
                      title: id,
                      collection: [],
                    })
                );
                return createDatasetControl({
                  type: 'filters',
                  id,
                  title: id,
                  collection: filterCollection,
                });
              })
          : [],
      });
    }),
  });
});

export const TOP_LEVEL_CONTROL_ITEM: DatasetControlItem = {
  title: 'Kaartgegevens',
  id: 'mijn-buurt-datasets',
  collection: DATASET_CONTROL_ITEMS,
};

export const PARKEERZONES_POLYLINE_OPTIONS: Record<string, PolylineOptions> = {
  parkeerzones: {
    ...DEFAULT_POLYLINE_OPTIONS,
    color: themeColors.supplement.yellow,
  },
  parkeerzones_uitzondering: {
    ...DEFAULT_POLYLINE_OPTIONS,
    color: themeColors.supplement.pink,
  },
};
