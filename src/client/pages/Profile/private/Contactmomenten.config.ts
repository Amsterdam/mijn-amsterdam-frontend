import { ReactNode } from 'react';

import { ContactMoment } from '../../../../server/services/salesforce/contactmomenten.types';
import { FeatureToggle } from '../../../../universal/config/feature-toggles';
import { AppRoutes } from '../../../../universal/config/routes';
import { Themas, Thema } from '../../../../universal/config/thema';
import { DisplayProps } from '../../../components/Table/TableV2';

export type ContactMomentFrontend = ContactMoment & {
  themaKanaalIcon: ReactNode;
  subjectLink: ReactNode;
};

export const contactmomentenDisplayProps: DisplayProps<ContactMomentFrontend> =
  {
    themaKanaalIcon: 'Contactvorm',
    subjectLink: 'Onderwerp',
    datePublishedFormatted: 'Datum',
    referenceNumber: 'Referentienummer',
  };

export const routes = {
  listPage: AppRoutes['KLANT_CONTACT/CONTACTMOMENTEN'],
  themaPage: AppRoutes.BRP,
};

const SVWIv1ORv2 = FeatureToggle.svwiLinkActive ? Themas.SVWI : Themas.INKOMEN;

export const mapperContactmomentToMenuItem: Record<string, Thema> = {
  Parkeren: Themas.PARKEREN,
  Zorg: Themas.ZORG,
  'Werk en Inkomen': SVWIv1ORv2,
  Belastingen: Themas.BELASTINGEN,
  Geldzaken: Themas.KREFIA,
  Financiën: Themas.AFIS,
};
