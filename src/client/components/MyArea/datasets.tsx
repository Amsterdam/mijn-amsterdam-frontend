import { themeSpacing } from '@amsterdam/asc-ui';
import themeColors from '@amsterdam/asc-ui/es/theme/default/colors';
import { PolylineOptions } from 'leaflet';
import React, { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import styled from 'styled-components';
import { DATASETS } from '../../../universal/config';
import {
  DatasetId,
  DatasetPropertyName,
  getDatasetCategoryId,
} from '../../../universal/config/buurt';
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
import { DEFAULT_POLYLINE_OPTIONS } from './MyAreaPolylineLayer';
import { DatasetFilterSelection } from '../../../universal/config/buurt';

interface DatasetItem {
  id: string;
  title: string;
}

export interface DatasetCategoryItem extends DatasetItem {
  type: 'category';
  collection: DatasetControlItem[];
}

export interface DatasetControlItem extends DatasetItem {
  type: 'dataset';
  collection: DatasetFilterCategoryItem[];
}

export interface DatasetFilterCategoryItem extends DatasetItem {
  collection: DatasetFilterControlItem[];
  type: 'filters';
}

export interface DatasetFilterControlItem extends DatasetItem {
  datasetId: DatasetId;
  propertyName: DatasetPropertyName;
  type: 'filter';
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
    datasetIconHtml[getDatasetCategoryId(datasetId)] ||
    datasetIconHtml.default
  );
}

export function titleTransform(id: string) {
  return capitalizeFirstLetter(id).replace(/_/g, ' ');
}

export const createDatasetControlItems = (
  filterSelection: DatasetFilterSelection | null
) => {
  console.log('filterSelection', filterSelection);
  return Object.entries(DATASETS).map(([datasetCategoryId, datasetConfig]) => {
    const collection = Object.entries(datasetConfig).map(
      ([datasetId, config]) => {
        const filterConfig =
          filterSelection && filterSelection[datasetId]
            ? filterSelection[datasetId]
            : config;

        const collection =
          typeof filterConfig === 'object'
            ? Object.entries(filterConfig).map(
                ([propertyName, valueConfig]) => {
                  let propertyValues = valueConfig.values;
                  if (!Array.isArray(propertyValues)) {
                    propertyValues = [];
                  }
                  const filterCollection = propertyValues.map(
                    (propertyValue) => {
                      const datasetFilterControlItem: DatasetFilterControlItem = {
                        type: 'filter',
                        id: propertyValue,
                        title: propertyValue,
                        propertyName,
                        datasetId,
                      };
                      return datasetFilterControlItem;
                    }
                  );
                  const datasetFilterCategoryItem: DatasetFilterCategoryItem = {
                    type: 'filters',
                    id: propertyName,
                    title: propertyName,
                    collection: filterCollection,
                  };
                  return datasetFilterCategoryItem;
                }
              )
            : [];

        const datasetControlItem: DatasetControlItem = {
          id: datasetId,
          title: datasetId,
          type: 'dataset',
          collection,
        };

        return datasetControlItem;
      }
    );

    const datasetCategoryItem: DatasetCategoryItem = {
      id: datasetCategoryId,
      type: 'category',
      title: datasetCategoryId,
      collection,
    };

    return datasetCategoryItem;
  });
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
