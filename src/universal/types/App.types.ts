import type { FunctionComponent, ReactNode, SVGProps } from 'react';

import type {
  ServiceID,
  ServicesType,
} from '../../server/services/controller.ts';
import { type ApiResponse_DEPRECATED } from '../helpers/api.ts';
import type { SomeOtherString } from '../helpers/types.ts';

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

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

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

export const NOTIFICATION_SORTPRIORITY = {
  default: 3,
  high: 6,
} as const;

export interface MyNotification<ID extends string = string> {
  themaID: ID;
  themaTitle: string;
  datePublished: string;
  description?: string;
  hideDatePublished?: boolean;
  id: string;
  /** sortPriority defines the order in which notifications are displayed. A notification with a higher sortPriority is displayed before other non-alert notifications, even when those notifications have the same datePublished. Use NOTIFICATION_PRIORITY.<priority> to set the sortPriority in a readable manner */
  sortPriority?: (typeof NOTIFICATION_SORTPRIORITY)[keyof typeof NOTIFICATION_SORTPRIORITY];
  isAlert?: boolean;
  link?: LinkProps;
  subject?: string;
  title: string;

  // TIP notifications
  tipReason?: string;
  isTip?: true;
  isNotification?: true;

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

export type ZaakStatus =
  | 'Ontvangen'
  | 'In behandeling'
  | 'Afgehandeld'
  | 'Ingetrokken'
  | 'Meer informatie nodig'
  | 'Einde recht'
  | 'Verlopen'
  | SomeOtherString;

export type ZaakDisplayStatus =
  | ZaakStatus
  | 'Toegewezen'
  | 'Afgewezen'
  | 'Verleend'
  | 'Ingetrokken'
  | 'Niet verleend'
  | 'Onbekend';

export interface StatusLineItem<
  T extends ZaakStatus = string,
  S extends ZaakStatus = string,
> {
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
  substeps?: StatusLineItem<S>[];
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
