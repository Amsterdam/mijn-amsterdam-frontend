import { LinkProps } from '../../../universal/types/App.types';

export interface StadspasTransactieSource {
  id: number;
  transactiedatum: string;
  bedrag: number;
  pashouder: { id: number; hoofd_pashouder_id: number };
  pas: {
    id: number;
    pasnummer: number;
    pasnummer_volledig: string;
    originele_pas: {
      id: number;
      pasnummer: number;
      pasnummer_volledig: string;
    };
  };
  budget: {
    id: number;
    code: string;
    naam: string;
    aanbieder: { id: number; naam: string };
  };
}

export interface StadspasTransactiesResponseSource {
  number_of_items: number;
  total_items: number;
  transacties: StadspasTransactieSource[];
}

type AanbiedingAfbeeldingSource = {
  id: number;
  cdn_url: string;
  medium: string;
  size: string;
};

// NOTE: Taken straight from the documentation; not tested for variations
export type StadspasAanbiedingSource = {
  id: number;
  transactiedatum: string;
  verleende_korting: number;
  annulering: boolean;
  geannuleerd: boolean;
  pashouder: {
    id: number;
    hoofd_pashouder_id: number;
  };
  leeftijd_pashouder: number;
  pas: {
    id: number;
    pasnummer: number;
    pasnummer_volledig: string;
    originele_pas: {
      id: number;
      pasnummer: number;
      pasnummer_volledig: string;
    };
  };
  aanbieding: {
    id: number;
    aanbiedingnummer: number;
    publicatienummer: number;
    kortingzin?: string;
    omschrijving?: string;
    communicatienaam?: string;
    pijler: string;
    aanbieder: {
      id: number;
    };
    afbeeldingen: AanbiedingAfbeeldingSource[];
  };
};

export interface StadspasDiscountTransactionsResponseSource {
  number_of_items: number;
  total_items?: number;
  totale_aantal?: number;
  totale_korting?: number;
  transacties: StadspasAanbiedingSource[];
}

export type SecurityCode = string;

export interface StadspasHouderPasSource {
  actief: boolean;
  budgetten: unknown[]; // Did not see the exact shape of this data, encountered an empty array.
  categorie: string;
  categorie_code: string;
  expiry_date: string;
  heeft_budget: boolean;
  id: number;
  pasnummer: number;
  pasnummer_volledig: string;
  passoort: { id: number; naam: string };
  securitycode: SecurityCode;
  vervangen: boolean;
}

export interface StadspasHouderSource {
  initialen: string;
  achternaam: string;
  tussenvoegsel?: string;
  voornaam: string;
  passen?: StadspasHouderPasSource[];
  volledige_naam?: string;
}

export interface StadspasPasHouderResponse extends StadspasHouderSource {
  sub_pashouders: StadspasHouderSource[];
}

export interface StadspasDetailBudgetSource {
  code: string;
  naam: string;
  omschrijving?: string;
  expiry_date: string;
  budget_assigned: number;
  budget_balance: number;
}

export interface StadspasDetailSource {
  actief: boolean;
  balance_update_time: string;
  budgetten: StadspasDetailBudgetSource[];
  budgetten_actief: boolean;
  categorie: string;
  categorie_code: string;
  expiry_date: string;
  id: number;
  originele_pas: {
    categorie: string;
    categorie_code: string;
    id: number;
    pasnummer: number;
    pasnummer_volledig: string;
    passoort: { id: number; naam: string };
  };
  pasnummer: number;
  pasnummer_volledig: string;
  passoort: { id: number; naam: string };
  pashouder: StadspasHouderSource;
}

// Transformed types
export interface StadspasBudget {
  title: string;
  description: string;
  code: string;
  budgetAssigned: number;
  budgetAssignedFormatted: string;
  budgetBalance: number;
  budgetBalanceFormatted: string;
  dateEnd: string;
  dateEndFormatted: string;
}

export interface StadspasOwner {
  initials: string | null;
  firstname: string;
  infix?: string;
  lastname: string;
}

export interface Stadspas {
  id: string;
  passNumber: number;
  passNumberComplete: string;
  owner: StadspasOwner;
  dateEnd: string;
  dateEndFormatted: string;
  budgets: StadspasBudget[];
  balanceFormatted: string;
  balance: number;
  actief: boolean;
  securityCode: SecurityCode | null;
}

export type TransactionKeysEncrypted = string;

export interface StadspasFrontend extends Stadspas {
  urlTransactions: string;
  transactionsKeyEncrypted: string;
  blockPassURL?: string;
  unblockPassURL?: string;
  link?: LinkProps;
}

export type TransactionKeysEncryptedWithoutSessionID = string;

export interface StadspasAMSAPPFrontend extends Stadspas {
  transactionsKeyEncrypted: TransactionKeysEncryptedWithoutSessionID;
}

export interface StadspasTransactionQueryParams {
  pasnummer: Stadspas['passNumber'];
  sub_transactions: true;
  budgetcode?: string;
}

export interface StadspasBudgetTransaction {
  id: string;
  title: string;
  amount: number;
  amountFormatted: string;
  datePublished: string;
  datePublishedFormatted: string;
  budget: StadspasBudget['description'];
  budgetCode: StadspasBudget['code'];
}

export type StadspasDiscountTransactions = {
  discountAmountTotal: number;
  discountAmountTotalFormatted: string;
  transactions: StadspasDiscountTransaction[];
};

// TODO: Determine which props are needed for this type
export interface StadspasDiscountTransaction {
  id: string;
  title: StadspasAanbiedingSource['aanbieding']['communicatienaam'] | null;
  discountTitle: StadspasAanbiedingSource['aanbieding']['kortingzin'] | null;
  discountAmount: StadspasAanbiedingSource['verleende_korting'];
  discountAmountFormatted: string;
  datePublished: StadspasAanbiedingSource['transactiedatum'];
  datePublishedFormatted: string;
  description: StadspasAanbiedingSource['aanbieding']['omschrijving'] | null;
}

export type StadspasAdministratieNummer = string;

export type PasblokkadeByPasnummer = Record<
  StadspasFrontend['passNumber'],
  boolean
>;

export type StadspasResponseFrontend = {
  stadspassen: StadspasFrontend[];
  dateExpiryFormatted: string | null;
};
