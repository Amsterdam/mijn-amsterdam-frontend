import { ReactNode } from 'react';

import type { ContactMoment } from '../../../../server/services/salesforce/contactmomenten.types';
import { FeatureToggle } from '../../../../universal/config/feature-toggles';
import { ThemaID } from '../../../../universal/config/thema';
import type { DisplayProps } from '../../../components/Table/TableV2.types';

export type ContactMomentFrontend = ContactMoment & {
  themaKanaalIcon: ReactNode;
  subjectLink: ReactNode;
};

export const featureToggle = {
  themaActive: true,
};

export const contactmomentenDisplayProps: DisplayProps<ContactMomentFrontend> =
  {
    themaKanaalIcon: 'Contactvorm',
    subjectLink: 'Onderwerp',
    datePublishedFormatted: 'Datum',
    referenceNumber: 'Referentienummer',
  };

// TODO: Use all the individual thema ID's imported from the Thema Config files.
const SVWIv1ORv2 = FeatureToggle.svwiLinkActive ? 'SVWI' : 'INKOMEN';

export const mapperContactmomentToMenuItem: Record<string, ThemaID> = {
  Parkeren: 'PARKEREN',
  Zorg: 'ZORG',
  'Werk en Inkomen': SVWIv1ORv2,
  Belastingen: 'BELASTINGEN',
  Geldzaken: 'KREFIA',
  Financiën: 'AFIS',
};
