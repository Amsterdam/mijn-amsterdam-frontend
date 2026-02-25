import { ReactNode } from 'react';

import type { ContactMoment } from '../../../../../server/services/salesforce/contactmomenten.types';
import type { DisplayProps } from '../../../../components/Table/TableV2.types';
import { themaId as themaIdAfis } from '../../Afis/Afis-thema-config';
import { themaConfig as themaBelastingen } from '../../Belastingen/Belastingen-thema-config';
import { themaId as themaIdInkomen } from '../../Inkomen/Inkomen-thema-config';
import { themaId as themaIdKrefia } from '../../Krefia/Krefia-thema-config';
import { themaId as themaIdParkeren } from '../../Parkeren/Parkeren-thema-config';
import {
  featureToggle as featureToggleSvwi,
  themaId as themaIdSvwi,
} from '../../Svwi/Svwi-thema-config';
import { themaConfig } from '../../Zorg/Zorg-thema-config';

export type ContactMomentFrontend = ContactMoment & {
  themaKanaalIcon: ReactNode;
  subjectLink: ReactNode;
  className: string;
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
  Zorg: themaConfig.id,
  'Werk en Inkomen': SVWIv1ORv2,
  Belastingen: themaBelastingen.id,
  Geldzaken: themaIdKrefia,
  Financiën: themaIdAfis,
} as const;
