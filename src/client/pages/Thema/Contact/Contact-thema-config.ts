import type { ReactNode } from 'react';

import { generatePath } from 'react-router';

import type { ContactmomentFrontend } from '../../../../server/services/salesforce/klantcontact.types.ts';
import type { DisplayProps } from '../../../components/Table/TableV2.types.ts';
import type {
  ThemaConfigBase,
  WithPageConfig,
} from '../../../config/thema-types.ts';

export type ContactmomentProps = ContactmomentFrontend & {
  contacttypeField: ReactNode;
  subjectLink: ReactNode;
  className: string;
};

const THEMA_ID = 'CONTACT';
const THEMA_TITLE = 'Mijn contact';

type ContactThema = ThemaConfigBase &
  WithPageConfig<'listPageContactmomenten'> &
  WithPageConfig<'afspraakDetailQRCodePage'>;

const BASE_PATH = '/mijn-contact';

export const themaConfig: ContactThema = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  featureToggle: {
    active: true,
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
  afspraakDetailQRCodePage: {
    route: {
      path: `${BASE_PATH}/qrcode/:qrcode`,
      documentTitle: `QR Code voor uw afspraak | ${THEMA_TITLE}`,
      trackingUrl: null,
    },
  },
  pageLinks: [],
  uitlegPageSections: [
    {
      title: THEMA_TITLE,
      listItems: ['Contactmomenten', 'Afspraken'],
    },
  ],
};

const contactmomentenDisplayProps: DisplayProps<ContactmomentFrontend> = {
  contacttypeField: 'Contactvorm',
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
