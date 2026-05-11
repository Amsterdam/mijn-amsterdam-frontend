import { IS_PRODUCTION } from '../../../../universal/config/env';
import type { LinkProps } from '../../../../universal/types/App.types';
import { ThemaRoutesConfig } from '../../../config/thema-types';

export const themaId = 'CONTACT' as const;

export const featureToggle = {
  themaActive: !IS_PRODUCTION,
};

export const themaTitle = 'Contact en communicatie';

export const linkListItems: LinkProps[] = [];

export const routeConfig = {
  themaPage: {
    path: '/contact-en-communicatie',
    documentTitle: `${themaTitle} | Mijn Amsterdam`,
  },
  listPageContactmomenten: {
    get path(): string {
      return `/${routeConfig.themaPage.path}/contactmomenten/:page?`;
    },
    documentTitle: `Alle contactmomenten | ${themaTitle}`,
  },
  listPageCommunicatievoorkeuren: {
    get path(): string {
      return `/${routeConfig.themaPage.path}/communicatievoorkeuren/:page?`;
    },
    documentTitle: `Alle communicatievoorkeuren | ${themaTitle}`,
  },
  detailPageCommunicatievoorkeur: {
    get path(): string {
      return `/${routeConfig.themaPage.path}/communicatievoorkeur/:id`;
    },
    documentTitle: `Communicatievoorkeur | ${themaTitle}`,
  },
  detailPageCommunicatievoorkeurInstellen: {
    get path(): string {
      return `/${routeConfig.detailPageCommunicatievoorkeur.path}/instellen/:medium/:step`;
    },
    documentTitle: `Communicatievoorkeur instellen | ${themaTitle}`,
  },
} as const satisfies ThemaRoutesConfig;
