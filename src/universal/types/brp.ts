export interface Identiteitsbewijs {
  id: string;
  documentNummer: string;
  documentType: 'europese identiteitskaart' | 'paspoort' | string;
  datumUitgifte: string;
  datumAfloop: string;
  title?: string;
}

export interface Adres {
  straatnaam: string;
  postcode: string;
  woonplaatsNaam: string;
  huisnummer: string;
  huisnummertoevoeging: string | null;
  huisletter: string | null;
  begindatumVerblijf: string | null;
  inOnderzoek: boolean;
}

export interface Persoon {
  aanduidingNaamgebruikOmschrijving: string;
  bsn: string;
  geboortedatum: string;
  overlijdensdatum: string | null;
  geboortelandnaam: string;
  geboorteplaatsnaam: string;
  gemeentenaamInschrijving: string;
  voorvoegselGeslachtsnaam: string | null;
  geslachtsnaam: string;
  omschrijvingBurgerlijkeStaat: string;
  omschrijvingGeslachtsaanduiding: string | null;
  omschrijvingAdellijkeTitel: string | null;
  opgemaakteNaam: string;
  voornamen: string;
  nationaliteiten: Array<{ omschrijving: string }>;
  mokum: boolean;
  vertrokkenOnbekendWaarheen: boolean;
  datumVertrekUitNederland: string;
}

export interface Verbintenis {
  datumOntbinding: string | null;
  datumSluiting: string;
  landnaamSluiting: string;
  plaatsnaamSluitingOmschrijving: string;
  soortVerbintenis: string;
  soortVerbintenisOmschrijving: string;
  persoon: Partial<Persoon>;
}

export interface Kind {
  bsn: string;
  geboortedatum: string;
  geslachtsaanduiding: string;
  geslachtsnaam: string;
  overlijdensdatum: string | null;
  voornamen: string;
  voorvoegselGeslachtsnaam: string | null;
}

export interface BRPData {
  persoon: Persoon;
  verbintenis?: Verbintenis;
  verbintenisHistorisch?: Verbintenis[];
  kinderen?: Kind[];
  ouders: Partial<Persoon>[];
  adres: Adres;
  adresHistorisch?: Adres[];
  identiteitsbewijzen?: Identiteitsbewijs[];
}
