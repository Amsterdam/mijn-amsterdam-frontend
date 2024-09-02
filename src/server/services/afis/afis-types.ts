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

export type AfisFactuurOpen = {
  dunningBlockingReason: string;
  profitCenterName: string;
  sepaMandate: string;
  postingDate: string;
  netDueDate: string;
  netPaymentAmount: string;
  amountInBalanceTransacCrcy: string;
  invoiceNo: string;
  paylink: string;
};

export type AfisFactuurState = 'open' | 'closed';

export type AfisFactuurOpenSource =
  AfisApiFeedResponseSource<AfisFactuurOpenPropertiesSource>;

export type AfisFactuurOpenPropertiesSource = {
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

export type AfisFactuurAfgehandeld = {
  profitCenterName: string;
  netDueDate: string;
  reverseDocument: string;
  invoiceNo: string;
  invoiceNumberEncrypted: string;
};

export type AfisFactuurAfgehandeldSource =
  AfisApiFeedResponseSource<AfisFactuurAfgehandeldPropertiesSource>;

export type AfisFactuurAfgehandeldPropertiesSource = {
  ProfitCenterName: string;
  NetDueDate: string;
  ReverseDocument: string;
  InvoiceNo: string;
};
