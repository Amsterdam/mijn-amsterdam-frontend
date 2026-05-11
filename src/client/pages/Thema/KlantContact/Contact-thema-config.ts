import type { LinkProps } from '../../../../universal/types/App.types.ts';
import { isEnabled } from '../../../config/feature-toggles.ts';
import type { ThemaRoutesConfig } from '../../../config/thema-types.ts';

export const themaId = 'CONTACT' as const;

export const featureToggle = {
  themaActive: isEnabled('CONTACT.thema'),
};

export const themaTitle = 'Contact en communicatie';

export const linkListItems: LinkProps[] = [];

export const routeConfig = {
  themaPage: {
    path: '/contact-en-communicatie',
    documentTitle: `${themaTitle} | Mijn Amsterdam`,
    trackingUrl: null,
  },
  listPageContactmomenten: {
    get path(): string {
      return `/${routeConfig.themaPage.path}/contactmomenten/:page?`;
    },
    documentTitle: `Alle contactmomenten | ${themaTitle}`,
    trackingUrl: null,
  },
  detailPageCommunicatievoorkeurInstellen: {
    get path(): string {
      return `/${routeConfig.themaPage.path}/instellen/:id/:medium/:step`;
    },
    documentTitle: `Communicatievoorkeur instellen | ${themaTitle}`,
    trackingUrl: null,
  },
  detailPageCommunicatieMediumInstellen: {
    get path(): string {
      return `/${routeConfig.themaPage.path}/instellen/:medium/:step`;
    },
    documentTitle: `Communicatievoorkeur instellen | ${themaTitle}`,
    trackingUrl: null,
  },
} as const satisfies ThemaRoutesConfig;
