import type { ReactNode } from 'react';

import { generatePath } from 'react-router';

import type { ContactmomentFrontend } from '../../../../server/services/klantcontact/klantcontact.types.ts';
import type { DisplayProps } from '../../../components/Table/TableV2.types.ts';
import { isEnabled } from '../../../config/feature-toggles.ts';
import type {
  ThemaConfigBase,
  WithPageConfig,
} from '../../../config/thema-types.ts';

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
  kanaalEl: 'Contactvorm',
  subjectLink: 'Onderwerp',
  datePublishedFormatted: 'Datum',
  referenceNumber: 'Referentienummer',
};

export const tableConfigs = {
  contactmomenten: {
    title: 'Contactmomenten',
    displayProps: contactmomentenDisplayProps,
    listPageRoute: generatePath(themaConfig.listPageContactmomenten.route.path),
    maxItems: 5,
  },
};
