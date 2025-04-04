import { LatLngLiteral } from 'leaflet';

import { LinkProps } from './App.types';

export type AfvalFractionCode =
  | 'Textiel'
  | 'Rest'
  | 'Glas'
  | 'GA'
  | 'Plastic'
  | 'Papier'
  | 'GFT';

export interface AfvalFractionInformationTransformed {
  titel: string;
  instructie: string | null;
  instructieCTA: LinkProps | null;
  waar: string | LinkProps | null;
  ophaaldagen: string | null;
  buitenzetten: string | null;
  opmerking: string | null;
  kalendermelding: string | null;
  fractieCode: AfvalFractionCode;
  gebruiksdoelWoonfunctie: boolean;
}

export interface AfvalCenter {
  title: string;
  latlng: LatLngLiteral;
  distance: number;
  website: string;
}

export type AfvalPuntenData = AfvalCenter[];
