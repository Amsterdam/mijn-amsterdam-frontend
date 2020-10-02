import L, { DivIcon, Icon } from 'leaflet';
import { capitalizeFirstLetter } from '../../../universal/helpers';
import styles from './MyAreaSuperCluster.module.scss';
import classnames from 'classnames';

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

type MapDatasetIcon = Icon | DivIcon | ((item: any) => Icon | DivIcon);

export interface MapDataset extends Dataset {
  title: string;
  icon: MapDatasetIcon;
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
    icon: (item: any) =>
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
