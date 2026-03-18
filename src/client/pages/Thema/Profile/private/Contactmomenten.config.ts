import type { ReactNode } from 'react';

import type { ContactMoment } from '../../../../../server/services/salesforce/contactmomenten.types.ts';
import type { DisplayProps } from '../../../../components/Table/TableV2.types.ts';
import { themaId as themaIdAfis } from '../../Afis/Afis-thema-config.ts';
import { themaConfig as themaBelastingen } from '../../Belastingen/Belastingen-thema-config.ts';
import { themaConfig as themaInkomen } from '../../Inkomen/Inkomen-thema-config.ts';
import { themaConfig as themaKrefia } from '../../Krefia/Krefia-thema-config.ts';
import { themaConfig as themaParkeren } from '../../Parkeren/Parkeren-thema-config.ts';
import {
  featureToggle as featureToggleSvwi,
  themaId as themaIdSvwi,
} from '../../Svwi/Svwi-thema-config.ts';
import { themaConfig as themaZorg } from '../../Zorg/Zorg-thema-config.ts';

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
const SVWIv1ORv2 = featureToggleSvwi.svwiActive ? themaIdSvwi : themaInkomen.id;

export const mapperContactmomentToMenuItem = {
  Parkeren: themaParkeren.id,
  Zorg: themaZorg.id,
  'Werk en Inkomen': SVWIv1ORv2,
  Belastingen: themaBelastingen.id,
  Geldzaken: themaKrefia.id,
  Financiën: themaIdAfis,
} as const;
