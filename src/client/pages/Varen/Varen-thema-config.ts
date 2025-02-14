import { generatePath } from 'react-router-dom';

import { VarenFrontend } from '../../../server/services/varen/config-and-types';
import { IS_PRODUCTION } from '../../../universal/config/env';
import { AppRoutes } from '../../../universal/config/routes';
import { dateSort } from '../../../universal/helpers/date';
import { LinkProps } from '../../../universal/types';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../components/Table/TableV2';

const MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND = 5;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_COMPLETED = 5;

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
export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

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
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
    ...tableConfigBase,
  },
  [listPageParamKind.completed]: {
    title: 'Afgehandelde aanvragen',
    filter: (vergunning: VarenFrontend) => vergunning.dateEnd,
    listPageRoute: generatePath(AppRoutes['VAREN/LIST'], {
      kind: listPageParamKind.completed,
    }),
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_COMPLETED,
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
