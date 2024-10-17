import { LinkProps } from '../../../universal/types';

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
    count?: number;
    entry?: [
      {
        content?: {
          properties?: T;
        };
      },
    ];
  };
};

export type AfisBusinessPartnerAddressSource = {
  AddressID: string;
};

export type AfisBusinessPartnerDetailsSource = {
  BusinessPartner: number;
  BusinessPartnerFullName: string;
};

export type AfisBusinessPartnerPhoneSource = {
  InternationalPhoneNumber: string;
};

export type AfisBusinessPartnerEmailSource = {
  EmailAddress: string;
};

export type AfisBusinessPartnerDetails = {
  fullName: string;
};

export type AfisBusinessPartnerAddressId = number | null;

export type AfisBusinessPartnerPhone = {
  phone: string | null;
};

export type AfisBusinessPartnerEmail = {
  email: string | null;
};

export type AfisBusinessPartnerDetailsTransformed = {
  businessPartnerId: string;
  email?: string | null;
  fullName?: string | null;
  phone?: string | null;
};

export type AfisFactuurState = 'open' | 'afgehandeld' | 'overgedragen';

export type AfisFacturenResponse = {
  count: number;
  facturen: AfisFactuur[];
};

export type AfisFacturenByStateResponse = {
  [key in AfisFactuurState]?: AfisFacturenResponse | null;
};

export type AfisFacturenParams = {
  state: AfisFactuurState;
  businessPartnerID: string;
  top?: string;
};

export type AfisFactuur = {
  id: string;
  afzender: string;
  datePublished: string | null;
  datePublishedFormatted: string | null;
  paymentDueDate: string;
  paymentDueDateFormatted: string;
  debtClearingDate: string | null;
  debtClearingDateFormatted: string | null;
  amountOwed: number;
  amountOwedFormatted: string;
  factuurNummer: string;
  factuurDocumentId: string;
  status: AfisFactuurStatus;
  paylink: string | null;
  documentDownloadLink: string | null;
  statusDescription: string;
  link: LinkProps;
};

type AfisFactuurStatus =
  | 'openstaand'
  | 'automatische-incasso'
  | 'in-dispuut'
  | 'gedeeltelijke-betaling'
  | 'overgedragen-aan-belastingen'
  | 'geld-terug'
  | 'betaald'
  | 'geannuleerd'
  | 'herinnering'
  | 'onbekend';

export type AfisOpenInvoiceSource =
  AfisApiFeedResponseSource<AfisFactuurPropertiesSource>;

/** Extra property information
 *  ==========================
 * `ProfitCenterName`: The one requiring payment from the debtor (debiteur).
 * `NetPaymentAmount`: Is a negative decimal number and represents money that is -
 *   already payed for this item.
 * `AmountInBalanceTransacCrcy`: Is a decimal number and represents the amount that should be payed.
 *   When this is negative it is a 'krediet factuur' which means that money shall be returned -
 *   to the debtor.
 *  `IsCleared`: `true` means the 'factuur' is fully payed for.
 */
export type AfisFactuurPropertiesSource = {
  AccountingDocument: string;
  AccountingDocumentType: string;
  AmountInBalanceTransacCrcy: string;
  ClearingDate?: string;
  DocumentReferenceID: string;
  DunningBlockingReason: string;
  DunningLevel: number;
  IsCleared?: boolean;
  NetDueDate: string;
  NetPaymentAmount: string;
  Paylink: string | null;
  PostingDate: string;
  ProfitCenterName: string;
  ReverseDocument?: string;
  SEPAMandate: string;
};

export type AfisArcDocID = AfisDocumentIDPropertiesSource['ArcDocId'];

export type AfisDocumentIDSource =
  AfisApiFeedResponseSource<AfisDocumentIDPropertiesSource>;

export type AfisDocumentIDPropertiesSource = {
  ArcDocId: string;
};

export type AfisDocumentDownloadSource = {
  Record: {
    attachment: string;
    attachmentname: string;
  };
};
