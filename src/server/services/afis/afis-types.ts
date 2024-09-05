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

export type AfisOpenInvoice = {
  profitCenterName: string;
  postingDate: string;
  dueDate: string;
  dueDateFormatted: string;
  amount: number;
  amountFormatted: string;
  invoiceNoEncrypted: string;
  invoiceStatus: 'open' | 'automatische-incasso' | 'dispuut' | null;
  paylink: string | null;
};

export type AfisInvoiceState = 'open' | 'closed';

export type AfisOpenInvoiceSource =
  AfisApiFeedResponseSource<AfisOpenInvoicePropertiesSource>;

export type AfisOpenInvoicePropertiesSource = {
  DunningLevel: number;
  DunningBlockingReason: string;
  ProfitCenterName: string;
  SEPAMandate: string;
  PostingDate: string;
  NetDueDate: string;
  NetPaymentAmount: string;
  AmountInBalanceTransacCrcy: string;
  InvoiceNo: string;
  Paylink: string;
};

export type AfisClosedInvoice = {
  profitCenterName: string;
  dueDate: string;
  dueDateFormatted: string;
  invoiceNoEncrypted: string;
  invoiceStatus: 'betaald' | 'geannuleerd' | null;
};

export type AfisCloseInvoiceSource =
  AfisApiFeedResponseSource<AfisClosedInvoicePropertiesSource>;

export type AfisClosedInvoicePropertiesSource = {
  DunningLevel: number;
  ProfitCenterName: string;
  NetDueDate: string;
  ReverseDocument: string;
  InvoiceNo: string;
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
