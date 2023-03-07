import { LatLngLiteral } from 'leaflet';
import { LinkProps } from './App.types';

export enum Stadsdeel {
  centrum = 'Centrum',
  nieuwWest = 'Nieuw-West',
  noord = 'Noord',
  oost = 'Oost',
  west = 'West',
  zuid = 'Zuid',
  zuidoost = 'Zuidoost',
}

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

export type AFVALPUNTENData = GarbageCenter[];
