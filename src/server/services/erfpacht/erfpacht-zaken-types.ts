export type ErfpachtZaakDetailSource = {
  url: string;
  uuid: string;
  identificatie: string;
  bronorganisatie: string;
  omschrijving: string;
  toelichting: string;
  zaaktype: string | ZaaktypeRef;
  registratiedatum: string;
  verantwoordelijkeOrganisatie: string;
  startdatum: string;
  einddatum: string;
  einddatumGepland: string;
  uiterlijkeEinddatumAfdoening: string;
  publicatiedatum: string;
  communicatiekanaal: string | CommunicatieKanaalRef;
  productenOfDiensten: Array<string | ProductOfServiceRef>;
  vertrouwelijkheidaanduiding: string;
  betalingsindicatie: string;
  betalingsindicatieWeergave: string;
  laatsteBetaaldatum: string;
  zaakgeometrie: ZaakGeometrie;
  verlenging?: Verlenging;
  opschorting?: Opschorting;
  selectielijstklasse: string | SelectielijstKlasseRef;
  hoofdzaak?: string | HoofdzaakRef;
  deelzaken?: Array<string | DeelzaakRef>;
  relevanteAndereZaken?: RelevanteAndereZaak[];
  eigenschappen?: Eigenschap[];
  rollen?: Rol[];
  status?: string | StatusRef;
  zaakinformatieobjecten?: Array<string | ZaakInformatieObjectRef>;
  zaakobjecten?: Array<string | ZaakObjectRef>;
  kenmerken?: Kenmerk[];
  archiefnominatie?: string;
  archiefstatus?: string;
  archiefactiedatum?: string;
  resultaat?: string | ResultaatRef;
  opdrachtgevendeOrganisatie?: string;
  processobjectaard?: string;
  startdatumBewaartermijn?: string;
  processobject?: ProcessObject;
  _expand?: ZaakDetailExpand;
};

export type ZaakDetailExpand = {
  zaaktype?: ZaaktypeExpand;
  communicatiekanaal?: Record<string, unknown>;
  productenOfDiensten?: Array<Record<string, unknown>>;
  selectielijstklasse?: Record<string, unknown>;
  hoofdzaak?: Record<string, unknown>;
  deelzaken?: Array<Record<string, unknown>>;
  relevanteAndereZaken?: Array<Record<string, unknown>>;
  eigenschappen?: EigenschapExpand[];
  rollen?: RolExpand[];
  status?: ZaakStatusExpand;
  zaakinformatieobjecten?: ZaakInformatieObjectExpand[];
  zaakobjecten?: ZaakObjectExpand[];
  resultaat?: ResultaatExpand;
};

export type ZaaktypeRef = {
  url: string;
};

export type ZaaktypeExpand = {
  url: string;
  identificatie: string;
  omschrijving: string;
  omschrijvingGeneriek?: string;
  vertrouwelijkheidaanduiding?: string;
  doel?: string;
  aanleiding?: string;
  toelichting?: string;
  indicatieInternOfExtern?: string;
  handelingInitiator?: string;
  onderwerp?: string;
  handelingBehandelaar?: string;
  doorlooptijd?: string;
  servicenorm?: string;
  opschortingEnAanhoudingMogelijk?: boolean;
  verlengingMogelijk?: boolean;
  verlengingstermijn?: string;
  trefwoorden?: string[];
  publicatieIndicatie?: boolean;
  publicatietekst?: string;
  verantwoordingsrelatie?: string[];
  productenOfDiensten?: string[];
  selectielijstProcestype?: string;
  referentieproces?: ReferentieProces;
  verantwoordelijke?: string;
  zaakobjecttypen?: string[];
  broncatalogus?: BroncatalogusRef;
  bronzaaktype?: BronZaaktypeRef;
  catalogus?: string;
  statustypen?: string[];
  resultaattypen?: string[];
  eigenschappen?: string[];
  informatieobjecttypen?: string[];
  informatieobjecttypeOmschrijving?: string[];
  roltypen?: string[];
  besluittypen?: string[];
  besluittypeOmschrijving?: string[];
  deelzaaktypen?: string[];
  gerelateerdeZaaktypen?: GerelateerdeZaaktype[];
  beginGeldigheid?: string;
  eindeGeldigheid?: string;
  beginObject?: string;
  eindeObject?: string;
  versiedatum?: string;
  concept?: boolean;
};

export type ReferentieProces = {
  naam?: string;
  link?: string;
};

export type BroncatalogusRef = {
  url?: string;
  domein?: string;
  rsin?: string;
};

export type BronZaaktypeRef = {
  url?: string;
  identificatie?: string;
  omschrijving?: string;
};

export type GerelateerdeZaaktype = {
  zaaktype?: string;
  aardRelatie?: string;
  toelichting?: string;
};

export type CommunicatieKanaalRef = {
  url?: string;
};

export type ProductOfServiceRef = {
  url?: string;
};

export type Verlenging = {
  reden?: string;
  duur?: string;
};

export type Opschorting = {
  indicatie?: boolean;
  reden?: string;
};

export type ZaakGeometrie = {
  type: string;
  coordinates: number[];
};

export type SelectielijstKlasseRef = {
  url?: string;
};

export type HoofdzaakRef = {
  url?: string;
};

export type DeelzaakRef = {
  url?: string;
};

export type RelevanteAndereZaak = {
  url?: string;
  aardRelatie?: string;
};

export type Eigenschap = {
  url?: string;
  uuid?: string;
  zaak?: string;
  eigenschap?: string;
  naam?: string;
  waarde?: string;
  _expand?: EigenschapExpand;
};

export type EigenschapExpand = {
  eigenschap?: EigenschapRefExpand;
};

export type EigenschapRefExpand = {
  url?: string;
  naam?: string;
  catalogus?: string;
  definitie?: string;
  specificatie?: Specificatie;
  toelichting?: string;
  zaaktype?: string;
  zaaktypeIdentificatie?: string;
  statustype?: string;
  beginGeldigheid?: string;
  eindeGeldigheid?: string;
  beginObject?: string;
  eindeObject?: string;
};

export type Specificatie = {
  groep?: string;
  formaat?: string;
  lengte?: string;
  kardinaliteit?: string;
  waardenverzameling?: string[];
};

export type Rol = {
  url?: string;
  uuid?: string;
  zaak?: string;
  betrokkene?: string;
  betrokkeneType?: string;
  afwijkendeNaamBetrokkene?: string;
  roltype?: string;
  omschrijving?: string;
  omschrijvingGeneriek?: string;
  roltoelichting?: string;
  registratiedatum?: string;
  indicatieMachtiging?: string;
  contactpersoonRol?: ContactpersoonRol;
  statussen?: string[];
  _expand?: RolExpand;
};

export type ContactpersoonRol = {
  emailadres?: string;
  functie?: string;
  telefoonnummer?: string;
  naam?: string;
};

export type RolExpand = {
  betrokkene?: Record<string, unknown>;
  roltype?: RoltypeRef;
  statussen?: Array<Record<string, unknown> | null>;
};

export type RoltypeRef = {
  url?: string;
  zaaktype?: string;
  zaaktypeIdentificatie?: string;
  omschrijving?: string;
  omschrijvingGeneriek?: string;
  catalogus?: string;
  beginGeldigheid?: string;
  eindeGeldigheid?: string;
};

export type StatusRef = {
  url?: string;
};

export type ZaakInformatieObjectRef = {
  url?: string;
};

export type ZaakObjectRef = {
  url?: string;
};

export type Kenmerk = {
  kenmerk?: string;
  bron?: string;
};

export type ProcessObject = {
  datumkenmerk?: string;
  identificatie?: string;
  objecttype?: string;
  registratie?: string;
};

export type ZaakInformatieObjectExpand = {
  url?: string;
  identificatie?: string;
  bronorganisatie?: string;
  creatiedatum?: string;
  titel?: string;
  vertrouwelijkheidaanduiding?: string;
  tonenAanInitiator?: boolean;
  auteur?: string;
  status?: string;
  inhoudIsVervallen?: boolean;
  formaat?: string;
  taal?: string;
  versie?: number;
  beginRegistratie?: string;
  bestandsomvang?: number;
  link?: string;
  beschrijving?: string;
  ontvangstdatum?: string;
  verzenddatum?: string;
  indicatieGebruiksrecht?: boolean;
  verschijningsvorm?: string;
  ondertekening?: Ondertekening;
  integriteit?: Integriteit;
  informatieobjecttype?: string;
  locked?: boolean;
  bestandsdelen?: Bestandsdeel[];
  trefwoorden?: string[];
};

export type Ondertekening = {
  soort?: string;
  datum?: string;
};

export type Integriteit = {
  algoritme?: string;
  waarde?: string;
  datum?: string;
};

export type Bestandsdeel = {
  url?: string;
  volgnummer?: number;
  omvang?: number;
  voltooid?: boolean;
  lock?: string;
};

export type ZaakObjectExpand = {
  url?: string;
  uuid?: string;
  zaak?: string;
  object?: string;
  zaakobjecttype?: string;
  objectType?: string;
  objectTypeOverige?: string;
  objectTypeOverigeDefinitie?: Record<string, unknown>;
  relatieomschrijving?: string;
  _expand?: Record<string, unknown>;
};

export type ResultaatRef = {
  url?: string;
};

export type ResultaatExpand = {
  url?: string;
  uuid?: string;
  zaak?: string;
  resultaattype?: string;
  toelichting?: string;
  _expand?: {
    resultaattype?: Record<string, unknown>;
  };
};

export type ErfpachtZaakStatussenSource = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ZaakStatusResult[];
};

export type ZaakStatusResult = {
  url: string;
  uuid: string;
  zaak: string;
  statustype: string;
  datumStatusGezet: string;
  statustoelichting?: string;
  indicatieLaatstGezetteStatus?: boolean;
  gezetdoor?: string;
  zaakinformatieobjecten: Array<string | ZaakInformatieObjectRef>;
  _expand: ZaakStatusExpand;
};

export type ZaakStatusExpand = {
  [key: string]: unknown;
};
