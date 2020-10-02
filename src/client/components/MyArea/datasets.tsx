import { themeSpacing } from '@amsterdam/asc-ui';
import themeColors from '@amsterdam/asc-ui/es/theme/default/colors';
import classnames from 'classnames';
import L, { Marker } from 'leaflet';
import React, { ReactElement, ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import styled from 'styled-components';
import { DatasetItemTuple } from '../../../server/services';
import { capitalizeFirstLetter } from '../../../universal/helpers';
import {
  MapIconAfvalGft,
  MapIconAfvalGlas,
  MapIconAfvalPlastic,
  MapIconAfvalRest,
  MapIconAfvalTextiel,
  MapIconAuto,
} from '../../assets/icons';
import styles from './MyAreaSuperCluster.module.scss';
import { DEFAULT_WMS_OPTIONS, DEFAULT_POLYLINE_OPTIONS } from './MaWmsLayer';

export type DatasetSource = Record<string, DatasetItemTuple[]>;

export interface DatasetsSource {
  id: string;
  collection: DatasetSource;
}

export type Dataset = Record<string, Marker[]>;

export interface Datasets {
  id: string;
  collection: Dataset;
}

export interface DatasetControl {
  id: string;
  isActive: boolean;
  title: string;
  icon: ReactNode;
  layerType: LayerType;
}

export interface DatasetControlItem {
  id: string;
  title: string;
  collection: DatasetControl[];
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
    className: classnames(styles.MarkerIcon, className),
    iconSize,
    html: `<span class="${styles.MarkerIconLabel}">${label}</span>`,
    iconAnchor,
  });
}

export const DATASETS = {
  afvalcontainers: ['rest', 'papier', 'glas', 'plastic', 'textiel', 'gft'],
  parkeren: ['parkeerzones', 'parkeerzones_uitz'],
  bekendmakingen: [
    'apv vergunning',
    'evenementenvergunning',
    'exploitatievergunning',
    'inspraak',
    'kapvergunning',
    'ligplaatsvergunning',
    'meldingen',
    'omgevingsvergunning',
    'onttrekkingsvergunning',
    'openingstijden',
    'rectificatie',
    'speelautomaten',
    'splitsingsvergunning',
    'terrasvergunning',
    'verkeersbesluit',
    'overig',
    'geluidvergunning',
    'bestemmingsplan',
    'drank- en horecavergunning',
  ],
  evenementen: ['evenementen'],
};

const DatasetIcon = styled.div`
  margin-right: ${themeSpacing(2)};
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
`;

const DatasetIconCircle = styled(DatasetIcon)`
  width: 16px;
  height: 16px;
`;

const DatasetIconSquare = styled(DatasetIconCircle)`
  border-radius: 0;
`;

const DatasetIconTriangle = styled(DatasetIconSquare)`
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 10px 20px 10px;
  border-color: transparent transparent #ffffff;
  position: relative;

  &:before {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    bottom: -18px;
    left: -7px;
    border-style: solid;
    border-width: 0 7px 14px 7px;
    border-color: transparent transparent ${(props) => props.color};
  }
`;

const datasetIcons: Record<string, ReactElement<any>> = {
  rest: (
    <DatasetIcon style={{ backgroundColor: themeColors.tint.level6 }}>
      <MapIconAfvalRest fill={themeColors.tint.level1} />
    </DatasetIcon>
  ),
  papier: (
    <DatasetIcon style={{ backgroundColor: themeColors.support.valid }}>
      <MapIconAfvalRest fill={themeColors.tint.level1} />
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

  // Parkeren
  parkeerzones: (
    <DatasetIcon style={{ backgroundColor: themeColors.supplement.yellow }}>
      <MapIconAuto />
    </DatasetIcon>
  ),
  parkeerzones_uitz: (
    <DatasetIcon style={{ backgroundColor: themeColors.supplement.pink }}>
      <MapIconAuto fill={themeColors.tint.level1} />
    </DatasetIcon>
  ),

  // Evenementen
  evenementen: (
    <DatasetIconCircle
      style={{ backgroundColor: themeColors.supplement.lightgreen }}
    />
  ),

  // Bekendmakingen
  evenementenvergunning: (
    <DatasetIconTriangle color={themeColors.support.valid} />
  ),
  exploitatievergunning: (
    <DatasetIconCircle
      style={{ backgroundColor: themeColors.supplement.pink }}
    />
  ),
  inspraak: (
    <DatasetIconCircle style={{ backgroundColor: themeColors.primary.main }} />
  ),
  kapvergunning: (
    <DatasetIconCircle style={{ backgroundColor: themeColors.support.focus }} />
  ),
  ligplaatsvergunning: (
    <DatasetIconSquare style={{ backgroundColor: themeColors.support.valid }} />
  ),
  meldingen: (
    <DatasetIconCircle
      style={{ backgroundColor: themeColors.supplement.orange }}
    />
  ),
  omgevingsvergunning: (
    <DatasetIconCircle style={{ backgroundColor: themeColors.support.valid }} />
  ),
  onttrekkingsvergunning: (
    <DatasetIconCircle
      style={{ backgroundColor: themeColors.supplement.lightgreen }}
    />
  ),
  // ????
  openingstijden: (
    <DatasetIconSquare
      style={{ backgroundColor: themeColors.supplement.pink }}
    />
  ),
  rectificatie: (
    <DatasetIconSquare
      style={{ backgroundColor: themeColors.supplement.orange }}
    />
  ),
  // ????
  speelautomaten: (
    <DatasetIconSquare
      style={{ backgroundColor: themeColors.supplement.purple }}
    />
  ),
  splitsingsvergunning: (
    <DatasetIconCircle
      style={{ backgroundColor: themeColors.supplement.lightgreen }}
    />
  ),
  terrasvergunning: (
    <DatasetIconCircle style={{ backgroundColor: themeColors.tint.level4 }} />
  ),
  verkeersbesluit: (
    <DatasetIconTriangle color={themeColors.supplement.orange} />
  ),
  'apv vergunning': <DatasetIconTriangle color={themeColors.error.main} />,
  overig: (
    <DatasetIconSquare style={{ backgroundColor: themeColors.primary.main }} />
  ),
  // ????
  geluidvergunning: (
    <DatasetIconCircle
      style={{ backgroundColor: themeColors.supplement.lightgreen }}
    />
  ),
  // ????
  bestemmingsplan: (
    <DatasetIconCircle
      style={{ backgroundColor: themeColors.supplement.lightgreen }}
    />
  ),
  'drank- en horecavergunning': (
    <DatasetIconCircle
      style={{ backgroundColor: themeColors.supplement.lightgreen }}
    />
  ),
};

export const datasetIconHtml = Object.fromEntries(
  Object.entries(datasetIcons).map(([datasetId, icon]) => {
    return [datasetId, renderToStaticMarkup(icon)];
  })
);

export function getIcon(id: string) {
  return datasetIcons[id] || <></>;
}

export function getIconHtml(id: string) {
  return datasetIconHtml[id] || '';
}

export enum LayerType {
  Wms,
  Cluster,
}

const createDatasetControl = (
  id: string,
  isActive: boolean = true,
  layerType: LayerType = LayerType.Cluster
) => {
  return {
    id,
    icon: getIcon(id),
    title: capitalizeFirstLetter(id),
    isActive,
    layerType,
  };
};

export const DATASET_CONTROL_ITEMS: DatasetControlItem[] = [
  {
    id: 'parkeren',
    title: 'Parkeren',
    collection: DATASETS.parkeren.map((id) =>
      createDatasetControl(id, false, LayerType.Wms)
    ),
  },
  {
    id: 'afvalcontainers',
    title: 'Afvalcontainers',
    collection: DATASETS.afvalcontainers.map((id) =>
      createDatasetControl(id, true)
    ),
  },

  {
    id: 'bekendmakingen',
    title: 'Bekendmakingen',
    collection: DATASETS.bekendmakingen.map((id) =>
      createDatasetControl(id, true)
    ),
  },

  {
    id: 'evenementen',
    title: 'Evenementen',
    collection: DATASETS.evenementen.map((id) =>
      createDatasetControl(id, true)
    ),
  },
];

export const PARKEERZONES_WMS_OPTIONS = {
  parkeerzones: {
    ...DEFAULT_WMS_OPTIONS,
    layers: 'parkeerzones',
  },
  parkeerzones_uitz: {
    ...DEFAULT_WMS_OPTIONS,
    layers: 'parkeerzones_uitz',
  },
};

export const PARKEERZONES_POLYLINE_OPTIONS = {
  parkeerzones: {
    ...DEFAULT_POLYLINE_OPTIONS,
    color: themeColors.supplement.yellow,
  },
  parkeerzones_uitz: {
    ...DEFAULT_POLYLINE_OPTIONS,
    color: themeColors.supplement.pink,
  },
};
