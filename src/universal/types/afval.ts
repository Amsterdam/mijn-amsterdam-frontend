import { LatLngLiteral } from 'leaflet';

export enum Stadsdeel {
  centrum = 'Centrum',
  nieuwWest = 'Nieuw-West',
  noord = 'Noord',
  oost = 'Oost',
  west = 'West',
  zuid = 'Zuid',
  zuidoost = 'Zuidoost',
}

export interface GarbageRetrievalMoment {
  title: string;
  aanbiedwijze: string;
  stadsdeel: Stadsdeel;
  type: 'grofvuil' | 'huisvuil';
  buitenZetten: string;
  ophaaldag: string;
  opmerking: string;
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

export type AFVALData = GarbageRetrievalMoment[];
export type AFVALPUNTENData = GarbageCenter[];
