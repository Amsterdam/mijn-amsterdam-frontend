import { Icon, themeSpacing } from '@datapunt/asc-ui';
import classnames from 'classnames';
import L, { DivIcon } from 'leaflet';
import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { capitalizeFirstLetter } from '../../../universal/helpers';
import iconMapAfvalGftUrl from '../../assets/icons/map/gft.svg';
import iconMapAfvalGlasUrl from '../../assets/icons/map/glas.svg';
import iconMapAfvalPlasticUrl from '../../assets/icons/map/plastic.svg';
import iconMapAfvalTextielUrl from '../../assets/icons/map/textile.svg';
import iconMapAfvalRestUrl from '../../assets/icons/map/trashcontainer.svg';
import styles from './MyAreaSuperCluster.module.scss';

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
  parkeren: ['parkeerzones'],
  bekendmakingen: [
    'verkeersbesluit',
    'omgevingsvergunning',
    'onttrekkingsvergunning',
    'apv vergunning',
    'evenementenvergunning',
    'rectificatie',
    'geluidvergunning',
    'bestemmingsplan',
    'overig',
    'exploitatievergunning',
    'ligplaatsvergunning',
    'meldingen',
    'splitsingsvergunning',
    'inspraak',
    'drank- en horecavergunning',
    'kapvergunning',
    'terrasvergunning',
  ],
  evenementen: ['evenementen'],
};

const DatasetIcon = styled(Icon)`
  background-size: 14px 14px;
  background-repeat: no-repeat;
  background-position: center;
  margin-right: ${themeSpacing(2)};
  border-radius: 50%;
  width: 24px;
  height: 24px;
`;

const DatasetIconFillWhite = styled(DatasetIcon)`
  background-color: #ffffff;
  filter: invert(100%);
`;

const datasetIcons: Record<string, ReactNode> = {
  rest: <DatasetIconFillWhite iconUrl={iconMapAfvalRestUrl} />,
  papier: (
    <DatasetIcon
      style={{ backgroundColor: '#00A03C' }}
      iconUrl={iconMapAfvalRestUrl}
    />
  ),
  glas: (
    <DatasetIcon
      style={{ backgroundColor: '#FFE600' }}
      iconUrl={iconMapAfvalGlasUrl}
    />
  ),
  textiel: <DatasetIconFillWhite iconUrl={iconMapAfvalTextielUrl} />,
  gft: (
    <DatasetIcon
      style={{ backgroundColor: '#FFE600' }}
      iconUrl={iconMapAfvalGftUrl}
    />
  ),
  plastic: (
    <DatasetIcon
      style={{ backgroundColor: '#FF9100' }}
      iconUrl={iconMapAfvalPlasticUrl}
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
