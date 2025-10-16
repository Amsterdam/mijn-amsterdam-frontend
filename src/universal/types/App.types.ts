import { FunctionComponent, ReactNode, SVGProps } from 'react';

import { ServiceID, ServicesType } from '../../server/services/controller';
import type { ZaakStatus } from '../../server/services/decos/decos-types';
import { ApiResponse_DEPRECATED } from '../helpers/api';

export type AppStateBase = {
  [key in ServiceID]: ApiResponse_DEPRECATED<
    ReturnTypeAsync<ServicesType[key]>['content']
  >;
};

export type AppState = AppStateBase;
export type AppStateKey = keyof AppState;

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

export type ButtonLinkProps = LinkProps & {
  isDisabled?: boolean;
};

export type SVGComponent = FunctionComponent<
  SVGProps<SVGSVGElement> & { title?: string | undefined }
>;

export interface MyNotification<ID extends string = string> {
  themaID: ID;
  themaTitle: string;
  datePublished: string;
  description?: string;
  hideDatePublished?: boolean;
  id: string;
  isAlert?: boolean;
  link?: LinkProps;
  subject?: string;
  title: string;

  // TIP notifications
  tipReason?: string;
  isTip?: true;

  // NOTE: Maybe move this to client?
  customLink?: {
    callback: () => void;
    title: string;
  };
}

export interface GenericDocument {
  id: string;
  title: string;
  filename?: string;
  url: string;
  download?: string;
  external?: boolean;
  datePublished: string;
  isVisible?: boolean;
}

export type AltDocumentContent = string | ReactNode;

export interface StatusLineItem<T extends ZaakStatus = string> {
  id: string;
  status: T;
  datePublished: string;
  description?: string;
  documents?: GenericDocument[];
  isActive: boolean;
  isChecked: boolean;
  isVisible?: boolean;
  altDocumentContent?: AltDocumentContent;
  actionButtonItems?: LinkProps[];
}

export interface ZaakAanvraagDetail<T extends ZaakStatus = string> {
  id: string;
  title: string;
  steps: StatusLineItem<T>[];
  link: LinkProps;
  about?: string;
  displayStatus: string;
}

export interface ZaakDetail {
  id: string;
  title: string;
  link: LinkProps;
  about?: string;
}

export type StatusLine = ZaakAanvraagDetail;

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

export const PROFILE_TYPES = [
  'private',
  'commercial',
  'private-attributes',
] as const;

export const AUTH_METHODS = ['eherkenning', 'digid'] as const;

declare global {
  type ProfileType = (typeof PROFILE_TYPES)[number];
  type AuthMethod = (typeof AUTH_METHODS)[number];
}
