import { LatLngLiteral } from 'leaflet';
import { LinkProps } from './App.types';

export type GarbageFractionCode =
  | 'Textiel'
  | 'Rest'
  | 'Glas'
  | 'GA'
  | 'Plastic'
  | 'Papier'
  | 'GFT';

export interface GarbageFractionInformationTransformed {
  titel: string;
  instructie: string | null;
  instructieCTA: LinkProps | null;
  waar: string | LinkProps | null;
  ophaaldagen: string | null;
  buitenzetten: string | null;
  opmerking: string | null;
  kalendermelding: string | null;
  fractieCode: GarbageFractionCode;
  stadsdeelAanvulling: string | null;
  gebruiksdoelWoonfunctie: boolean;
}

export interface GarbageCenter {
  title: string;
  latlng: LatLngLiteral;
  url: string;
  address: string;
  phone: string;
  email: string;
  distance: number;
  website: string;
}

export type AfvalPuntenData = GarbageCenter[];
