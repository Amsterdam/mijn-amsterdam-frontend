export enum Stadsdeel {
  centrum = 'Centrum',
  nieuwWest = 'Nieuw-West',
  noord = 'Noord',
  oost = 'Oost',
  west = 'West',
  zuid = 'Zuid',
  zuidoost = 'Zuidoost',
}

export interface GarbageMoment {
  title: string;
  aanbiedwijze: string;
  stadsdeel: Stadsdeel;
  type: 'grofvuil' | 'huisvuil';
  buitenZetten: string;
  ophaaldag: string;
  opmerking: string;
}

export interface GarbagePoint {
  naam: string;
  adres: string;
  telefoon: string;
  email: string;
  latlng: LatLngObject;
  distance?: number;
  openingstijden?: string;
}

export interface AFVALData {
  ophalen: GarbageMoment[];
  wegbrengen: GarbagePoint[];
}
