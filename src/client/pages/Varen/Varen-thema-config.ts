import { generatePath } from 'react-router-dom';

import {
  VarenFrontend,
  VarenRegistratieRederType,
  VarenVergunningExploitatieType,
  VarenVergunningLigplaatsType,
} from '../../../server/services/varen/config-and-types';
import { IS_PRODUCTION } from '../../../universal/config/env';
import { AppRoutes } from '../../../universal/config/routes';
import { dateSort } from '../../../universal/helpers/date';
import { LinkProps } from '../../../universal/types';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../components/Table/TableV2';

const displayPropsAanvragen: DisplayProps<
  WithDetailLinkComponent<VarenFrontend>
> = {
  detailLinkComponent: '',
  title: 'Omschrijving',
  dateRequestFormatted: 'Aangevraagd',
  status: 'Status',
};

const listPageParamKind = {
  inProgress: 'lopende-aanvragen',
  completed: 'afgehandelde-aanvragen',
};

const tableConfigBase = {
  sort: dateSort('dateRequest', 'desc'),
  displayProps: displayPropsAanvragen,
};

export const tableConfig = {
  [listPageParamKind.inProgress]: {
    title: 'Lopende aanvragen',
    filter: (vergunning: VarenFrontend) => !vergunning.dateEnd,
    listPageRoute: generatePath(AppRoutes['VAREN/LIST'], {
      kind: listPageParamKind.inProgress,
    }),
    ...tableConfigBase,
  },
  [listPageParamKind.completed]: {
    title: 'Afgehandelde aanvragen',
    filter: (vergunning: VarenFrontend) => vergunning.dateEnd,
    listPageRoute: generatePath(AppRoutes['VAREN/LIST'], {
      kind: listPageParamKind.completed,
    }),
    ...tableConfigBase,
  },
} as const;

export const varenMeerInformatieLink: LinkProps = {
  to: 'https://www.amsterdam.nl/verkeer-vervoer/varen-amsterdam/varen-beroepsvaart/#:~:text=De%20passagiersvaart%20in%20Amsterdam%20is,stad%20willen%20we%20graag%20behouden.',
  title: 'Meer informatie over passagiers- en beroepsvaart',
} as const;

const formulierenBaseUrl = `https://formulieren${IS_PRODUCTION ? '' : '.acc'}.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam`;
export const exploitatieVergunningAanvragen: LinkProps = {
  to: `${formulierenBaseUrl}/VARExploitatievergunningAanvragen.aspx`,
  title: 'Exploitatievergunning aanvragen',
} as const;

export const exploitatieVergunningWijzigen: (key: string) => LinkProps = (
  key
) => ({
  to: `${formulierenBaseUrl}/VARExploitatievergunningWijzigen.aspx?guid=${key}`,
  title: 'Wijzigen',
});

export const ligplaatsVergunningLink: LinkProps = {
  to: `${formulierenBaseUrl}/Ligplaatsbedrijfsvaartuig.aspx`,
  title: 'Ligplaatsvergunning aanvragen',
} as const;

export type LabelMap<T extends object> = Partial<Record<keyof T, string>>;
export const labelMapThemaRegistratieReder = {
  company: 'Bedrijfsnaam',
  email: 'E-mailadres',
  phone: 'Telefoonnummer',
  bsnkvk: 'KVK nummer',
  address: 'Adres',
} as const satisfies LabelMap<VarenRegistratieRederType>;

export const labelMapsThemaDetail = {
  'Varen vergunning exploitatie': {
    id: 'Zaaknummer',
    vesselName: 'Naam van het vaartuig',
    segment: 'Segment',
    vesselWidth: 'Breedte van het vaartuig',
    vesselLength: 'Lengte van het vaartuig',
  } satisfies LabelMap<VarenVergunningExploitatieType>,
  'Varen ligplaatsvergunning': {
    id: 'Zaaknummer',
    vesselName: 'Naam van het vaartuig',
    location: 'Ligplek',
  } satisfies LabelMap<VarenVergunningLigplaatsType>,
  'Varen registratie reder': {
    id: 'Zaaknummer',
    ...labelMapThemaRegistratieReder,
  } satisfies LabelMap<VarenRegistratieRederType>,
} as const;
