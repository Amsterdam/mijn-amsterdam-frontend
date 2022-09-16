import { FunctionComponent, ReactNode, SVGProps } from 'react';
import { Chapter } from '../config';

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
  id: string;
  chapter: Chapter;
  datePublished: string;
  title: string;
  description: string;
  moreInformation?: string;
  link?: LinkProps;
  hideDatePublished?: boolean;
  isAlert?: boolean;

  // NOTE: Maybe move this to client?
  customLink?: {
    callback: () => void;
    title: string;
  };
}

export interface MyTip {
  id: string;
  datePublished: string;
  title: string;
  description: string;
  link: LinkProps;
  imgUrl?: string;
  isPersonalized: boolean;
  priority?: number;
  reason: string[];
  audience?: string[];
}

export interface GenericDocument {
  id: string;
  title: string;
  url: string;
  download?: string;
  datePublished: string;
  [key: string]: any;
}

export type AltDocumentContent = string | JSX.Element;

export interface StatusLineItem {
  id: string;
  status: string;
  datePublished: string;
  description: string;
  documents: GenericDocument[];
  isActive?: boolean;
  isChecked?: boolean;
  altDocumentContent?: AltDocumentContent;
  [key: string]: any;
}

export interface StatusLine {
  id: string;
  title: string;
  about?: string;
  link?: LinkProps;
  steps: StatusLineItem[];
  [key: string]: any;
}

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
