import type { ReactNode } from 'react';

import { generatePath } from 'react-router';

import type { ContactmomentFrontend } from '../../../../server/services/klantcontact/klantcontact.types.ts';
import type { DisplayProps } from '../../../components/Table/TableV2.types.ts';
import { isEnabled } from '../../../config/feature-toggles.ts';
import type {
  InfoSection,
  ThemaConfigBase,
  WithPageConfig,
} from '../../../config/thema-types.ts';

export type InstelAction = 'instellen' | 'wijzigen' | 'valideren';

export type ContactmomentFrontendFinal = ContactmomentFrontend & {
  kanaalEl: ReactNode;
  subjectLink: ReactNode;
  className: string;
};

const THEMA_ID = 'KLANT_CONTACT';
const THEMA_TITLE = 'Contact met de gemeente';

type ContactThema = ThemaConfigBase &
  WithPageConfig<'listPageContactmomenten'> &
  WithPageConfig<'detailPageContactgegevenInstellen'> &
  WithPageConfig<'listPageAfspraken'>;

const BASE_PATH = '/mijn-contact';

export const themaConfig = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  featureToggle: {
    active: isEnabled('KLANT_CONTACT.thema'),
    afspraken: {
      active: isEnabled('KLANT_CONTACT.afspraken'),
    },
    communicatievoorkeuren: {
      active: isEnabled('KLANT_CONTACT.communicatievoorkeuren'),
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
  detailPageContactgegevenInstellen: {
    route: {
      get path(): string {
        return `/${themaConfig.route.path}/contactgegeven-instellen/:contactgegeven/:step`;
      },
      documentTitle: `Contactgegeven instellen | ${THEMA_TITLE}`,
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
  get uitlegPageSections(): InfoSection[] {
    return [
      {
        title: THEMA_TITLE,
        listItems: [
          'Contactmomenten',
          themaConfig.featureToggle.afspraken.active ? 'Afspraken' : '',
          themaConfig.featureToggle.communicatievoorkeuren.active
            ? 'Communicatievoorkeuren'
            : '',
        ].filter(Boolean),
      },
    ];
  },
} as const satisfies ContactThema;

const contactmomentenDisplayProps: DisplayProps<ContactmomentFrontendFinal> = {
  props: {
    kanaalEl: 'Contactvorm',
    subjectLink: 'Onderwerp',
    datePublishedFormatted: 'Datum',
    referenceNumber: 'Referentienummer',
  },
  colWidths: {
    large: ['25%', '30%', '25%', '20%'],
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
} as const;
