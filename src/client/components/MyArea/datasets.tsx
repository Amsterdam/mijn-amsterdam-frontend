import { Icon, themeSpacing } from '@datapunt/asc-ui';
import themeColors from '@datapunt/asc-ui/es/theme/default/colors';
import classnames from 'classnames';
import L, { DivIcon } from 'leaflet';
import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { capitalizeFirstLetter } from '../../../universal/helpers';
import styles from './MyAreaSuperCluster.module.scss';
import {
  MapIconAfvalRest,
  MapIconAfvalTextiel,
  MapIconAfvalPlastic,
  MapIconAuto,
  MapIconAfvalGft,
  MapIconAfvalGlas,
} from '../../assets/icons';

export interface DatasetItem {
  id: string;
  title: string;
  latLng: LatLngObject;
  type: string;
  [key: string]: any;
}

export interface Dataset {
  id: string;
  items: DatasetItem[];
}

type MapDatasetIcon = L.Icon | DivIcon | ((item: any) => L.Icon | DivIcon);

export interface MapDataset extends Dataset {
  title: string;
  icon: ReactNode;
  createMarkerIcon: MapDatasetIcon;
  isLoading: boolean;
  isActive: boolean;
  datasetType: 'superCluster' | 'shapes';
}

export interface MapDatasetItem extends DatasetItem {
  icon: MapDatasetIcon;
}

export interface DatasetControlItem {
  id: string;
  title: string;
  datasets: MapDataset[];
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
  parkeren: ['parkeerzones', 'parkeerzonesuitzonderingen'],
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
  border-width: 0 7px 14px 7px;
  border-color: transparent transparent ${(props) => props.color};
`;

const datasetIcons: Record<string, ReactNode> = {
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
  parkeerzonesuitzonderingen: (
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

function getIcon(id: string) {
  return datasetIcons[id] || <></>;
}

const defaultDataset = (
  groupId: string,
  datasetType: MapDataset['datasetType'],
  isActive: boolean = true,
  id: string
) => {
  return {
    id,
    isLoading: true,
    items: [],
    icon: getIcon(id),
    createMarkerIcon: (item: any) =>
      createMarkerIcon({ label: '1', className: 'icoontje' }),
    title: capitalizeFirstLetter(id),
    datasetType,
    isActive,
  };
};

export const DATASET_CONTROL_ITEMS: DatasetControlItem[] = [
  {
    id: 'parkeren',
    title: 'Parkeren',
    datasets: DATASETS.parkeren.map(
      defaultDataset.bind(null, 'parkeren', 'shapes', false)
    ),
  },
  {
    id: 'afvalcontainers',
    title: 'Afvalcontainers',
    datasets: DATASETS.afvalcontainers.map(
      defaultDataset.bind(null, 'afvalcontainers', 'superCluster', true)
    ),
  },

  {
    id: 'bekendmakingen',
    title: 'Bekendmakingen',
    datasets: DATASETS.bekendmakingen.map(
      defaultDataset.bind(null, 'bekendmakingen', 'superCluster', true)
    ),
  },

  {
    id: 'evenementen',
    title: 'Evenementen',
    datasets: DATASETS.evenementen.map(
      defaultDataset.bind(null, 'evenementen', 'superCluster', true)
    ),
  },
];
