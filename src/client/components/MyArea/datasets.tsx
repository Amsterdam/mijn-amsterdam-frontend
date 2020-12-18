import { themeSpacing } from '@amsterdam/asc-ui';
import themeColors from '@amsterdam/asc-ui/es/theme/default/colors';
import { PolylineOptions } from 'leaflet';
import React, { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import styled from 'styled-components';
import { MaPointFeature } from '../../../server/services/buurt/datasets';
import { getDatasetCategoryId } from '../../../universal/config/buurt';
import {
  MapIconAfvalGft,
  MapIconAfvalGlas,
  MapIconAfvalPapier,
  MapIconAfvalPlastic,
  MapIconAfvalRest,
  MapIconAfvalTextiel,
  MapIconBasketbal,
  MapIconBekendmaking,
  MapIconEvenement,
  MapIconFitness,
  MapIconSport,
  MapIconTennis,
  MapIconVoetbal,
  MapIconVolleybal,
} from '../../assets/icons';
import { DEFAULT_POLYLINE_OPTIONS } from './MyAreaPolylineLayer';

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
  voetbal: (
    <DatasetIcon style={{ backgroundColor: themeColors.support.valid }}>
      <MapIconVoetbal fill={themeColors.tint.level1} />
    </DatasetIcon>
  ),
  volleybal: (
    <DatasetIcon style={{ backgroundColor: themeColors.support.valid }}>
      <MapIconVolleybal fill={themeColors.tint.level1} />
    </DatasetIcon>
  ),
  basketbal: (
    <DatasetIcon style={{ backgroundColor: themeColors.support.valid }}>
      <MapIconBasketbal fill={themeColors.tint.level1} />
    </DatasetIcon>
  ),
  fitness: (
    <DatasetIcon style={{ backgroundColor: themeColors.support.valid }}>
      <MapIconFitness fill={themeColors.tint.level1} />
    </DatasetIcon>
  ),
  tennis: (
    <DatasetIcon style={{ backgroundColor: themeColors.support.valid }}>
      <MapIconTennis fill={themeColors.tint.level1} />
    </DatasetIcon>
  ),
  default: (
    <DatasetIconCircle style={{ backgroundColor: themeColors.support.valid }} />
  ),
};

const datasetIconHtml = Object.fromEntries(
  Object.entries(datasetIcons).map(([id, icon]) => {
    return [id, renderToStaticMarkup(icon)];
  })
);

export function getIconHtml(feature: MaPointFeature) {
  const datasetId = feature.properties.datasetId;
  const datasetCategoryId = getDatasetCategoryId(datasetId);
  const icon =
    datasetIconHtml[datasetId] ||
    (datasetCategoryId && datasetIconHtml[datasetCategoryId]) ||
    datasetIconHtml.default;

  switch (datasetId) {
    case 'afvalcontainers':
      return (
        datasetIconHtml[
          feature.properties.fractie_omschrijving?.toLowerCase()
        ] || icon
      );
    case 'openbaresportplek':
      return (
        datasetIconHtml[feature.properties.sportvoorziening?.toLowerCase()] ||
        icon
      );
  }

  return icon;
}

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
