import { FunctionComponent, ReactNode, SVGProps } from 'react';
import { Thema } from '../config/thema';
import { ServiceID, ServicesType } from '../../server/services/controller';
import { ApiResponse } from '../helpers/api';

export type BagThema = `${Thema}_BAG`;

export type AppState = {
  [key in ServiceID]: ApiResponse<
    ReturnTypeAsync<ServicesType[key]>['content']
  >;
} & {
  // A place to store additional data not loaded initially but needs to be stored persistently in the app.
  [key in BagThema]?: Record<string, any>;
};

export type AppStateKey = Exclude<keyof AppState, BagThema>;

// Generic object interface
export interface Unshaped {
  [key: string]: any;
}

// Generic action for use with useReducer hooks
export interface Action {
  type: string;
  payload?: any;
}

export interface LinkProps {
  to: string;
  title: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
  download?: string;
}

export type SVGComponent = FunctionComponent<
  SVGProps<SVGSVGElement> & { title?: string | undefined }
>;

export type ComponentChildren = ReactNode;

export interface MyNotification {
  thema: Thema;
  datePublished: string;
  description: string;
  hideDatePublished?: boolean;
  id: string;
  isAlert?: boolean;
  isTip?: boolean;
  tipReason?: string;
  link?: LinkProps;
  moreInformation?: string;
  subject?: string;
  title: string;

  // NOTE: Maybe move this to client?
  customLink?: {
    callback: () => void;
    title: string;
  };
}

export interface MyTip {
  thema?: Thema | null;
  datePublished: string;
  description: string;
  id: string;
  imgUrl?: string;
  link: LinkProps;
  priority?: number;
  profileTypes?: ProfileType[];
  reason: string;
  title: string;
}

export interface GenericDocument {
  id: string;
  title: string;
  url: string;
  download?: string;
  external?: boolean;
  datePublished: string;
}

export type AltDocumentContent = string | ReactNode;

export interface StatusLineItem {
  id: string;
  status: string;
  datePublished: string;
  description?: string;
  documents?: GenericDocument[];
  resultaat?: string;
  isActive: boolean;
  isChecked: boolean;
  isVisible?: boolean;
  altDocumentContent?: AltDocumentContent;
}

export interface ZaakDetail {
  id: string;
  title: string;
  steps: StatusLineItem[];
  link: LinkProps;
  about?: string;
}
export type StatusLine = ZaakDetail;

export interface ApiError {
  name: string;
  error: string;
  stateKey: string;
}

export interface Match {
  isExact: boolean;
  params: Record<string, string>;
  path: string;
  url: string;
}
