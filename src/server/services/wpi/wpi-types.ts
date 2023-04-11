import { LinkProps } from '../../../universal/types';

export interface WpiRequestStatusDocument {
  id: string;
  title: string;
  url: string;
  datePublished: string;
}

export interface WpiRequestStatus {
  id: string;
  status: string;
  documents: WpiRequestStatusDocument[];
  datePublished: string;
  productSpecific?: 'lening' | 'uitkering';
  [key: string]: any;
}

export interface WpiRequestStatusHerstelTermijn extends WpiRequestStatus {
  dateDecisionExpected: string;
  dateUserFeedbackExpected: string;
}

export interface WpiRequestProcess {
  id: string;
  title: string;
  about:
    | 'Bijstandsuitkering'
    | 'Stadspas'
    | 'Tozo 1'
    | 'Tozo 2'
    | 'Tozo 3'
    | 'Tozo 4'
    | 'Tozo 5'
    | 'TONK'
    | 'Bbz'
    | string;
  dateStart: string;
  dateEnd: string | null;
  datePublished: string; // Date of latest step
  steps: WpiRequestStatus[];
  statusId: WpiRequestStatus['id'];
  decision: string | null;
  link?: LinkProps;
}

export type WpiRequestProcessContent<T = string> = (
  requestProcess: WpiRequestProcess,
  statusStep: WpiRequestStatus
) => T;

export interface WpiRequestStatusLabels {
  description: WpiRequestProcessContent;
  notification: {
    title: WpiRequestProcessContent;
    description: WpiRequestProcessContent;
    link?: WpiRequestProcessContent<LinkProps>;
  };
}

export interface WpiRequestProcessLabels {
  [id: string]: WpiRequestStatusLabels;
}

export interface WpiIncomeSpecification {
  datePublished: string;
  id: string;
  title: string;
  variant: string;
  url: string;
}

export interface WpiIncomeSpecificationTransformed
  extends WpiIncomeSpecification {
  displayDatePublished: string;
  category: string;
  download: string;
}

export interface WpiIncomeSpecificationResponseData {
  jaaropgaven: WpiIncomeSpecification[];
  uitkeringsspecificaties: WpiIncomeSpecification[];
}

export interface WpiIncomeSpecificationResponseDataTransformed {
  jaaropgaven: WpiIncomeSpecificationTransformed[];
  uitkeringsspecificaties: WpiIncomeSpecificationTransformed[];
}

export interface WpiStadspasBudget {
  description: string;
  code: string;
  budgetAssigned: number;
  budgetBalance: number;
  urlTransactions: string;
  dateEnd: string;
}

export interface WpiStadspas {
  id: string;
  passNumber: string;
  passType: 'kind' | 'ouder';
  owner: string;
  dateEnd: string;
  budgets: WpiStadspasBudget[];
  link?: LinkProps;
}

export interface WpiStadspasTransaction {
  id: string;
  title: string;
  amount: number;
  datePublished: string;
}

export interface WpiStadspasResponseData {
  stadspassen: WpiStadspas[];
  adminNumber: string;
}
