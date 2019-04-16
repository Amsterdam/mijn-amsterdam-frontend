import { FunctionComponent, SVGProps } from 'react';

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
}

export type SVGComponent = FunctionComponent<SVGProps<SVGElement>>;

// export type ChildContent =
//   | React.ReactChild
//   | SVGComponent
//   | undefined
//   | JSX.Element
//   | null;

// export type ComponentChildren =
//   | ChildContent
//   | ChildContent[]
//   | ChildContent[][];

export type ComponentChildren = any;
