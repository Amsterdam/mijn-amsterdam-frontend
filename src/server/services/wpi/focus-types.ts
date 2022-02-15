import { LinkProps } from 'react-router-dom';

export interface WpiRequestStatusDocument {
  id: string;
  title: string;
  url: string;
  datePublished: string;
}

export interface WpiRequestStatus {
  id: string;
  title: string;
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
  dateStart: string;
  dateEnd: string | null;
  datePublished: string; // Date of latest step
  steps: WpiRequestStatus[];
  status: WpiRequestStatus['id'];
  decision: string | null;
}

export type WpiTextPartContents<T = string> = (
  requestProcess: WpiRequestProcess,
  statusStep: WpiRequestStatus
) => T;

export interface WpiRequestStatusLabels {
  description: WpiTextPartContents;
  notification: {
    title: WpiTextPartContents;
    description: WpiTextPartContents;
    link?: WpiTextPartContents<LinkProps>;
  };
}

export interface WpiRequestProcessLabels {
  [id: string]: WpiRequestStatusLabels;
}
