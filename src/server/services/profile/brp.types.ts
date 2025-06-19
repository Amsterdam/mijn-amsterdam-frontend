import { ReactNode } from 'react';

import { ZaakDetail } from '../../../universal/types/App.types';

export type IdentiteitsbewijsFromSource = {
  id: string;
  documentNummer: string;
  documentType: 'europese identiteitskaart' | 'paspoort';
  datumUitgifte: string;
  datumAfloop: string;
};

export type IdentiteitsbewijsFrontend = ZaakDetail &
  IdentiteitsbewijsFromSource & {
    datumUitgifteFormatted: string;
    datumAfloopFormatted: string;
  };

export type Adres = {
  straatnaam: string | null;
  postcode: string | null;
  woonplaatsNaam: string | null;
  landnaam: string | null;
  huisnummer: string | null;
  huisnummertoevoeging: string | null;
  huisletter: string | null;
  begindatumVerblijf: string | null;
  begindatumVerblijfFormatted?: string | null;
  einddatumVerblijf?: string | null;
  aantalBewoners?: number;
  wozWaarde?: ReactNode | null;
  _adresSleutel?: string;
  mokum?: boolean;
  locatiebeschrijving?: string | null;
};

export type Persoon = {
  aanduidingNaamgebruikOmschrijving: string | null;
  bsn: string | null;
  geboortedatum: string | null;
  geboortedatumFormatted?: string | null;
  indicatieGeboortedatum?: 'J' | 'M' | 'D' | 'V' | null;
  overlijdensdatum: string | null;
  overlijdensdatumFormatted?: string | null;
  geboortelandnaam: string | null;
  geboorteplaatsnaam: string | null;
  gemeentenaamInschrijving: string | null;
  voorvoegselGeslachtsnaam: string | null;
  geslachtsnaam: string | null;
  omschrijvingBurgerlijkeStaat: string | null;
  omschrijvingGeslachtsaanduiding: string | null;
  omschrijvingAdellijkeTitel: string | null;
  opgemaakteNaam: string | null;
  voornamen: string | null;
  nationaliteiten: Array<{ omschrijving: string }>;
  mokum: boolean;
  vertrokkenOnbekendWaarheen: boolean;
  datumVertrekUitNederland: string | null;
  datumVertrekUitNederlandFormatted?: string | null;
  indicatieGeheim: boolean;
  adresInOnderzoek: '080000' | '089999' | null;
};

export type Verbintenis = {
  datumOntbinding: string | null;
  datumOntbindingFormatted?: string | null;
  datumSluiting: string | null;
  datumSluitingFormatted?: string | null;
  plaatsnaamSluitingOmschrijving?: string | null;
  soortVerbintenis?: string | null;
  soortVerbintenisOmschrijving?: string | null;
  persoon: Partial<Persoon>;
};

export type VerbintenisHistorisch = Verbintenis & {
  redenOntbindingOmschrijving?: string | null;
};

export type Kind = {
  bsn?: string | null;
  geboortedatum: string | null;
  geboortedatumFormatted?: string | null;
  geslachtsaanduiding?: string | null;
  geslachtsnaam: string | null;
  overlijdensdatum?: string | null;
  voornamen: string | null;
  voorvoegselGeslachtsnaam: string | null;
};

export type BRPDataFromSource = {
  kvkNummer?: string;
  persoon: Persoon;
  verbintenis?: Verbintenis;
  verbintenisHistorisch?: VerbintenisHistorisch[];
  kinderen?: Kind[];
  ouders: Partial<Persoon>[];
  adres: Adres;
  adresHistorisch?: Adres[];
  identiteitsbewijzen?: IdentiteitsbewijsFromSource[];
  fetchUrlAantalBewoners?: string;
};

export type BRPData = BRPDataFromSource & {
  identiteitsbewijzen?: IdentiteitsbewijsFrontend[];
};
