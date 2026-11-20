import {
  type ApiResponse,
  apiSuccessResult,
} from '../../../universal/helpers/api.ts';
import footerData from './footer-data.json' with { type: 'json' };

export type FooterLink = {
  label: string;
  url: string;
};

export type FooterSection = {
  title: string;
  links: FooterLink[];
};

export type Footer = {
  sections: FooterSection[];
  bottomLinks: FooterLink[];
};

const footer: Footer = footerData;

export function getFooter(): ApiResponse<Footer> {
  return apiSuccessResult(footer);
}
