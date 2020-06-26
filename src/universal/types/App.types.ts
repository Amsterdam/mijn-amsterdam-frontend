import { ReactNode, FunctionComponent, SVGProps } from 'react';
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
  link?: LinkProps;
  hideDatePublished?: boolean;
  isAlert?: boolean;

  // NOTE: Maybe move this to client?
  customLink?: {
    callback: () => void;
    title: string;
  };
}

export interface MyCase {
  id: string;
  chapter: Chapter;
  datePublished: string;
  title: string;
  link: LinkProps;
}

export interface MyTip {
  datePublished: string;
  title: string;
  description: string;
  link: LinkProps;
  imgUrl?: string;
  isPersonalized: boolean;
  priority?: number;
  reason?: string;
}

export interface GenericDocument {
  id: string;
  title: string;
  url: string;
  type: string;
  datePublished: string;
}
