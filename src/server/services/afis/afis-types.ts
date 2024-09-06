type JaOfNee = 'Ja' | 'Nee';

/** Business partner private response from external AFIS API.
 *
 *  # Properties
 *
 *  Record.BSN - Is a string when there is a leading zero present, otherwise a number.
 */
export type AfisBusinessPartnerPrivateResponseSource = {
  BSN: number | string;
  Gevonden: JaOfNee;
  Zakenpartnernummer?: string;
  Blokkade?: JaOfNee;
};

/** Business partner commercial response from external AFIS API.
 *
 *  # Properties
 *
 *  Record.KVK - Is a string when there is a leading zero present, otherwise a number.
 */
type AfisBusinessPartnerRecordCommercial = {
  KVK: number | string;
  Zakenpartnernummer?: string;
  Vestigingsnummer?: string;
  Blokkade: JaOfNee;
  Gevonden: JaOfNee;
};

export type AfisBusinessPartnerCommercialResponseSource = {
  Record:
    | AfisBusinessPartnerRecordCommercial
    | AfisBusinessPartnerRecordCommercial[];
};

export type AfisBusinessPartnerKnownResponse = {
  isKnown: boolean;
  businessPartnerIdEncrypted: string | null;
};

export type AfisApiFeedResponseSource<T> = {
  feed?: {
    entry?: [
      {
        content?: {
          properties?: T;
        };
      },
    ];
  };
};

export type AfisBusinessPartnerDetailsSource = {
  BusinessPartner: number;
  FullName: string;
  AddressID: number;
  CityName: string;
  Country: string;
  HouseNumber: number;
  HouseNumberSupplementText: string;
  PostalCode: string;
  Region: string;
  StreetName: string;
  StreetPrefixName: string;
  StreetSuffixName: string;
};

export type AfisBusinessPartnerPhoneSource = {
  InternationalPhoneNumber: string;
};

export type AfisBusinessPartnerEmailSource = {
  SearchEmailAddress: string;
};

export type AfisBusinessPartnerDetails = {
  businessPartnerId: number;
  fullName: string;
  address: string;
  addressId: number;
};

export type AfisBusinessPartnerPhone = {
  phone: string | null;
};

export type AfisBusinessPartnerEmail = {
  email: string | null;
};

export type AfisBusinessPartnerDetailsTransformed = AfisBusinessPartnerDetails &
  AfisBusinessPartnerPhone &
  AfisBusinessPartnerEmail;

export type AfisFactuurState = 'open' | 'closed';

export type AfisFactuur = {
  afzender: string;
  datePublished: string;
  datePublishedFormatted: string;
  dueDate: string;
  dueDateFormatted: string;
  clearingDate: string | null;
  clearingDateFormatted: string | null;
  amountOwed: number;
  amountOwedFormatted: string;
  factuurNummer: string;
  status: AfisFactuurStatus;
  paylink: string | null;
  documentDownloadLink: string | null;
};

type AfisFactuurStatus =
  | 'openstaand'
  | 'automatische-incasso'
  | 'in-dispuut'
  | 'gedeeltelijke-betaling'
  | 'betaald'
  | 'geannuleerd'
  | 'onbekend';

export type AfisOpenInvoiceSource =
  AfisApiFeedResponseSource<AfisFactuurPropertiesSource>;

/** # Extra property information
 *
 * `NetPaymentAmount`: Is a negative or zero decimal number and represents money that is -
 *   already payed for the 'factuur'.
 * `AmountInBalanceTransacCrcy`: Is a static decimal number and represents the amount that should be payed.
 *   When this is negative it might be a 'krediet factuur' which means that money shall be returned to the one -
 *   recieving this 'factuur' (RP TODO: Review 'krediet factuur' part when Danish knows more about this).
 */
export type AfisFactuurPropertiesSource = {
  DunningLevel: number;
  DunningBlockingReason: string;
  ProfitCenterName: string;
  SEPAMandate: string;
  PostingDate: string;
  AccountingDocumentType: string;
  NetDueDate: string;
  NetPaymentAmount: string;
  AmountInBalanceTransacCrcy: string;
  InvoiceNo: string;
  Paylink: string | null;
  IsCleared?: boolean;
  ClearingDate?: string;
  ReverseDocument?: string;
};

export type AfisArcDocID = AfisDocumentIDPropertiesSource['ArcDocId'];

export type AfisDocumentIDSource =
  AfisApiFeedResponseSource<AfisDocumentIDPropertiesSource>;

export type AfisDocumentIDPropertiesSource = {
  SapObject: string;
  ObjectId: number;
  ArchivId: string;
  ArcDocId: string;
  ArObject: string;
  ArDate: string;
  Reserve: string;
  CompanyCode: number;
  AccountNumber: number;
  ActYear: number;
};

export type AfisDocumentDownloadSource = {
  Record: {
    attachment: string;
    attachmentname: string;
  };
};
