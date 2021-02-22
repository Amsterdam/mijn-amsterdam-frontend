import { GenericDocument } from '../../../universal/types';

export type StepType =
  | 'first-step'
  | 'last-step'
  | 'intermediate-step'
  | 'single-step';

export type AltDocumentContent = string | JSX.Element;

export interface StatusLineItem {
  id: string;
  status: string;
  datePublished: string;
  description: string;
  documents: GenericDocument[];
  isActive?: boolean;
  isChecked?: boolean;
  isHighlight?: boolean;
  altDocumentContent?: AltDocumentContent;
  [key: string]: any;
}
