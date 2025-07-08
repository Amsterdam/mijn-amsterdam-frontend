import { ReactNode } from 'react';

import type { ContactMoment } from '../../../../../server/services/salesforce/contactmomenten.types.ts';
import type { DisplayProps } from '../../../../components/Table/TableV2.types.ts';
import { themaId as themaIdAfis } from '../../Afis/Afis-thema-config.ts';
import { themaId as themaIdBelastingen } from '../../Belastingen/Belastingen-thema-config.ts';
import { themaId as themaIdInkomen } from '../../Inkomen/Inkomen-thema-config.ts';
import { themaId as themaIdKrefia } from '../../Krefia/Krefia-thema-config.ts';
import { themaId as themaIdParkeren } from '../../Parkeren/Parkeren-thema-config.ts';
import {
  featureToggle as featureToggleSvwi,
  themaId as themaIdSvwi,
} from '../../Svwi/Svwi-thema-config.ts';
import { themaId as themaIdZorg } from '../../Zorg/Zorg-thema-config.ts';

export type ContactMomentFrontend = ContactMoment & {
  themaKanaalIcon: ReactNode;
  subjectLink: ReactNode;
};

export const featureToggle = {
  contactmomentenThemaActive: true,
};

export const contactmomentenDisplayProps: DisplayProps<ContactMomentFrontend> =
  {
    themaKanaalIcon: 'Contactvorm',
    subjectLink: 'Onderwerp',
    datePublishedFormatted: 'Datum',
    referenceNumber: 'Referentienummer',
  };

// TODO: Use all the individual thema ID's imported from the Thema Config files.
const SVWIv1ORv2 = featureToggleSvwi.svwiActive ? themaIdSvwi : themaIdInkomen;

export const mapperContactmomentToMenuItem = {
  Parkeren: themaIdParkeren,
  Zorg: themaIdZorg,
  'Werk en Inkomen': SVWIv1ORv2,
  Belastingen: themaIdBelastingen,
  Geldzaken: themaIdKrefia,
  Financiën: themaIdAfis,
} as const;
