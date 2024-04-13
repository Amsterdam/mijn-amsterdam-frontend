// import { GenericDocument, LinkProps } from '../../../universal/types';

export type WonenResponse = {
  '@onformdata.context': string;
  responsedata: string; // String with a encoded JSON message containing WonenRequestSource object.
};

export type WonenRequestsSource = {
  Requestor: {
    Initials: string;
    Firstname: string;
    Lastname: string;
    Mainphone: string | null;
    Mobilephone: string | null;
    Emailaddress: string;
  };
  Requests: WonenRequestSource[];
};

type WonenRequestSource = {
  Reference: string;
  RequestedOn: string;
  // Researchlocations: WonenResearchLocationSource[];
};

// type WonenResearchLocationSource = {
//   Reference: string;
//   Street: string;
//   Housenumber: string;
//   Houseletter: string | null;
//   Postalcode: string;
//   City: string;
//   Workorderid: string | null;
//   Workordercreatedon: string | null;
//   Friendlystatus: string;
//   Rejectionreason: string | null;
//   ReviewedOn: string | null;
//   Reportsenton: string | null;
//   Reportavailable: boolean;
// };

export type Woningen = {
  woningen: Woning[];
};

export type Woning = {
  id: string,
  opnamedatum: string,
  opnametype: string,
  status: string,
  berekeningstype: string,
  energieindex: string | null,
  energieklasse: string,
  energielabelIsPrive: string | null,
  isOpBasisVanReferentieGebouw: boolean,
  gebouwklasse: string,
  metingGeldigTot: string,
  registratiedatum: string,
  postcode: string,
  huisnummer: number,
  huisletter: string | null,
  huisnummertoevoeging: string | null,
  detailaanduiding: null,
  bagVerblijfsobjectId: string,
  bagLigplaatsId: string| null,
  bagStandplaatsId: string| null,
  bagPandId: string,
  gebouwtype: string,
  gebouwsubtype: string,
  projectnaam: string| null,
  projectobject: string| null,
  sbicode: string| null,
  gebruiksoppervlakteThermischeZone: string,
  energiebehoefte: string,
  eisEnergiebehoefte: string| null,
  primaireFossieleEnergie: string,
  eisPrimaireFossieleEnergie: string| null,
  primaireFossieleEnergieEmgForfaitair: string| null,
  aandeelHernieuwbareEnergie: string,
  eisAandeelHernieuwbareEnergie: string| null,
  aandeelHernieuwbareEnergieEmgForfaitair: string| null,
  temperatuuroverschrijding: string,
  eisTemperatuuroverschrijding: string| null,
  warmtebehoefte: string,
  energieindexMetEmgForfaitair: string| null
  // datumInbehandeling: string | null; // Workordercreatedon
  // datumAfgehandeld: string | null; // Reportsenton
  // datumBeoordeling: string | null; // ReviewedOn
  // status: string;
  // kenmerk: string;
  // aanvraagNummer: string;
  // rapportBeschikbaar: boolean;
  // link: LinkProps;
  // redenAfwijzing: string | null;
  // rapportId: string | null;
  // document: GenericDocument | null;
};

export type WoningDocument = {
  filename: string;
  mimetype: string;
  documentbody: string;
};
