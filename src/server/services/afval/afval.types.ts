import { LatLngLiteral } from 'leaflet';

import { LinkProps } from '../../../universal/types/App.types';

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

export interface AfvalFractionData {
  straatnaam: string;
  huisnummer: number;
  huisletter: string | null;
  huisnummertoevoeging: string | null;
  postcode: string;
  woonplaatsnaam: string;
  afvalwijzerInstructie: string | null;
  afvalwijzerPerXWeken: string | null;
  afvalwijzerBuitenzettenVanafTot: string | null;
  afvalwijzerBuitenzettenVanaf: string | null;
  afvalwijzerBuitenzettenTot: string | null;
  afvalwijzerAfvalkalenderOpmerking: string | null;
  afvalwijzerAfvalkalenderFrequentie: string | null;
  afvalwijzerFractieNaam: string;
  afvalwijzerFractieCode: AfvalFractionCode;
  afvalwijzerRoutetypeNaam: string | null;
  afvalwijzerOphaaldagen: string | null;
  afvalwijzerAfvalkalenderMelding: string | null;
  afvalwijzerAfvalkalenderVan: string | null;
  afvalwijzerAfvalkalenderTot: string | null;
  afvalwijzerInstructie2: string | null;
  afvalwijzerOphaaldagen2: string[] | string | null;
  afvalwijzerWaar: string | null;
  afvalwijzerBuitenzetten: string | null;
  afvalwijzerBasisroutetypeCode: string | null;
  afvalwijzerButtontekst: string | null;
  afvalwijzerUrl: string | null;
  gbdBuurtCode: string | null;
  bagNummeraanduidingId: string | null;
  gebruiksdoelWoonfunctie: boolean;
}

export interface AFVALSourceData {
  _embedded: {
    afvalwijzer: AfvalFractionData[];
  };
}
