import { themeSpacing } from '@amsterdam/asc-ui';
import themeColors from '@amsterdam/asc-ui/es/theme/default/colors';
import classnames from 'classnames';
import L, { PolylineOptions } from 'leaflet';
import React, { ReactElement, ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import styled from 'styled-components';
import {
  ACTIVE_DATASET_IDS_INITIAL,
  DATASETS,
} from '../../../universal/config';
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
import { DEFAULT_POLYLINE_OPTIONS } from './MaPolyLineLayer';
import styles from './MyAreaDatasets.module.scss';

export interface DatasetControl {
  id: string;
  isActive: boolean;
  title: string;
  icon: ReactNode;
}

export interface DatasetControlItem {
  id: string;
  title: string;
  collection: DatasetControl[];
  isActive: boolean;
}

interface createMarkerOptions {
  label: string;
  className?: string;
  iconSize?: [number, number];
  iconAnchor?: [number, number];
}

export function createMarkerIcon({
  label,
  className,
  iconSize = [40, 40],
  iconAnchor = [20, 20],
}: createMarkerOptions) {
  return L.divIcon({
    className: classnames(styles.MarkerClusterIcon, className),
    iconSize,
    html: `<span class="${styles.MarkerClusterIconLabel}">${label}</span>`,
    iconAnchor,
  });
}

const DatasetIcon = styled.div`
  margin-right: ${themeSpacing(2)};
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
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
  icon,
  title,
}: {
  id: string;
  icon?: ReactNode;
  title?: string;
}) => {
  return {
    id,
    icon,
    title: titleTransform(id),
    isActive: ACTIVE_DATASET_IDS_INITIAL.includes(id),
  };
};

export const DATASET_CONTROL_ITEMS: DatasetControlItem[] = [
  {
    id: 'parkeren',
    title: 'Parkeren',
    isActive: true,
    collection: DATASETS.parkeren.map((id) => createDatasetControl({ id })),
  },
  {
    id: 'afvalcontainers',
    title: 'Afvalcontainers',
    isActive: true,
    collection: DATASETS.afvalcontainers.map((id) =>
      createDatasetControl({ id })
    ),
  },
  {
    id: 'bekendmakingen',
    title: 'Bekendmakingen',
    isActive: true,
    collection: DATASETS.bekendmakingen.map((id) =>
      createDatasetControl({ id })
    ),
  },
  {
    id: 'evenementen',
    title: 'Evenementen',
    isActive: true,
    collection: DATASETS.evenementen.map((id) => createDatasetControl({ id })),
  },
  {
    id: 'sport',
    title: 'Sport & Bos',
    isActive: FeatureToggle.myAreaDataSportEnBosActive,
    collection: DATASETS.sport.map((id) => createDatasetControl({ id })),
  },
];

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
