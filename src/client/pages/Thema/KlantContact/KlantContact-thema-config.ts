import type { LinkProps } from '../../../../universal/types/App.types.ts';
import { isEnabled } from '../../../config/feature-toggles.ts';
import type { ThemaRoutesConfig } from '../../../config/thema-types.ts';

export const themaId = 'KLANT_CONTACT' as const;

export const featureToggle = {
  themaActive: isEnabled('KLANT_CONTACT.thema'),
};

export const themaTitle = 'Mijn contact met de gemeente';

export const linkListItems: LinkProps[] = [];

export type InstelAction = 'instellen' | 'wijzigen' | 'valideren';

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
      return `/${routeConfig.themaPage.path}/:action/:id/:medium/:step`;
    },
    documentTitle: `Communicatievoorkeur instellen | ${themaTitle}`,
    trackingUrl: null,
  },
  detailPageCommunicatieMediumInstellen: {
    get path(): string {
      return `/${routeConfig.themaPage.path}/:action/:medium/:step`;
    },
    documentTitle: `Communicatievoorkeur instellen | ${themaTitle}`,
    trackingUrl: null,
  },
} as const satisfies ThemaRoutesConfig;

export type ContactmomentProps = ContactmomentFrontend & {
  kanaalEl: ReactNode;
  subjectLink: ReactNode;
  className: string;
};

const THEMA_ID = 'CONTACT';
const THEMA_TITLE = 'Contact met de gemeente';

type ContactThema = ThemaConfigBase &
  WithPageConfig<'listPageContactmomenten'> &
  WithPageConfig<'listPageAfspraken'>;

const BASE_PATH = '/mijn-contact';

export const themaConfig = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  featureToggle: {
    active: true,
    afspraken: {
      active: isEnabled('KLANT_CONTACT.afspraken'),
    },
  },
  profileTypes: ['private'],
  redactedScope: 'content',
  route: {
    path: BASE_PATH,
    documentTitle: `${THEMA_TITLE} | overzicht`,
    trackingUrl: null,
  },
  listPageContactmomenten: {
    route: {
      path: `${BASE_PATH}/contactmomenten/:page?`,
      documentTitle: `Alle contactmomenten | ${THEMA_TITLE}`,
      trackingUrl: null,
    },
  },
  listPageAfspraken: {
    route: {
      path: `${BASE_PATH}/afspraken/:page?`,
      documentTitle: `Alle afspraken | ${THEMA_TITLE}`,
      trackingUrl: null,
    },
  },
  pageLinks: [
    {
      to: 'https://formulieren.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/contactformulier.aspx/',
      title: 'Contactformulier',
    },
    {
      to: 'tel:14020',
      title: 'Bel 14 020',
    },
  ],
  uitlegPageSections: [
    {
      title: THEMA_TITLE,
      listItems: ['Contactmomenten', 'Afspraken'],
    },
  ],
} as const satisfies ContactThema;

const contactmomentenDisplayProps: DisplayProps<ContactmomentProps> = {
  props: {
    kanaalEl: 'Contactvorm',
    subjectLink: 'Onderwerp',
    datePublishedFormatted: 'Datum',
    referenceNumber: 'Referentienummer',
  },
  colWidths: {
    large: ['25%', '40%', '20%', '15%'],
    small: ['30%', '50%', '20%', '0'],
  },
};

export const tableConfigs = {
  contactmomenten: {
    title: 'Contactmomenten',
    displayProps: contactmomentenDisplayProps,
    listPageRoute: generatePath(themaConfig.listPageContactmomenten.route.path),
    maxItems: 5,
  },
};
