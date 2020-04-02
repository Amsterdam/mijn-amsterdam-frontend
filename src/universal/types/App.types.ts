import React, { ReactNode } from 'react';

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

export type SVGComponent = React.FunctionComponent<
  React.SVGProps<SVGSVGElement>
>;
export type ComponentChildren = ReactNode;
