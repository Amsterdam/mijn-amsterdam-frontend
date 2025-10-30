import { ZaakAanvraagDetail } from '../../../universal/types/App.types';
import type { Adres, Kind, Persoon, Verbintenis } from '../brp/brp-types';

/** @deprecated */
export type IdentiteitsbewijsFromSource = {
  id: string;
  documentNummer: string;
  documentType: 'europese identiteitskaart' | 'paspoort';
  datumUitgifte: string;
  datumAfloop: string;
};

/** @deprecated */
export type IdentiteitsbewijsFrontend = ZaakAanvraagDetail &
  IdentiteitsbewijsFromSource & {
    datumUitgifteFormatted: string;
    datumAfloopFormatted: string;
  };

export type VerbintenisHistorisch = Verbintenis & {
  redenOntbindingOmschrijving?: string | null;
};

export type BRPDataFromSource = {
  kvkNummer?: string;
  persoon: Persoon;
  verbintenis?: Verbintenis;
  kinderen?: Kind[];
  ouders: Partial<Persoon>[];
  adres: Adres;
  /** @deprecated Deze gegevens worden in de BENK-BRP niet meer voorzien. */
  verbintenisHistorisch?: VerbintenisHistorisch[];
  /** @deprecated */
  adresHistorisch?: Adres[];
  /** @deprecated */
  identiteitsbewijzen?: IdentiteitsbewijsFromSource[];
  /** @deprecated */
  fetchUrlAantalBewoners?: string;
};

export type BRPData = BRPDataFromSource & {
  identiteitsbewijzen?: IdentiteitsbewijsFrontend[];
};
