import { generatePath } from 'react-router-dom';

import { isVergunning } from './helper';
import type { VarenVergunningFrontend } from '../../../server/services/varen/config-and-types';
import { IS_PRODUCTION } from '../../../universal/config/env';
import { AppRoutes } from '../../../universal/config/routes';
import { dateSort } from '../../../universal/helpers/date';
import { LinkProps } from '../../../universal/types';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../components/Table/TableV2';

const listPageParamKind = {
  inProgress: 'lopende-aanvragen',
  actief: 'actieve-vergunningen',
} as const;
export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

const tableConfigSort = {
  sort: dateSort('dateRequest', 'desc'),
};

type TableConfig<T> = {
  title: string;
  filter: (vergunning: T) => boolean;
  sort: (a: T, b: T) => number;
  displayProps: DisplayProps<T>;
  listPageRoute: string;
};

type TableConfigByKind<T> = Record<ListPageParamKind, TableConfig<T>>;
export const tableConfig: TableConfigByKind<
  WithDetailLinkComponent<VarenVergunningFrontend>
> = {
  [listPageParamKind.inProgress]: {
    title: 'Lopende aanvragen',
    filter: (vergunning: VarenVergunningFrontend) => !vergunning.processed,
    listPageRoute: generatePath(AppRoutes['VAREN/LIST'], {
      kind: listPageParamKind.inProgress,
    }),
    displayProps: {
      detailLinkComponent: 'Naam vaartuig',
      title: 'Omschrijving',
      dateRequestFormatted: 'Aangevraagd',
      status: 'Status',
    },
    ...tableConfigSort,
  },
  [listPageParamKind.actief]: {
    title: 'Actieve vergunningen',
    filter: isVergunning,
    listPageRoute: generatePath(AppRoutes['VAREN/LIST'], {
      kind: listPageParamKind.actief,
    }),
    displayProps: {
      detailLinkComponent: 'Naam vaartuig',
      title: 'Omschrijving',
      dateDecisionFormatted: 'Datum besluit',
      decision: 'Resultaat',
    },
    ...tableConfigSort,
  },
} as const;

export const varenMeerInformatieLink: LinkProps = {
  to: 'https://www.amsterdam.nl/verkeer-vervoer/varen-amsterdam/varen-beroepsvaart/#:~:text=De%20passagiersvaart%20in%20Amsterdam%20is,stad%20willen%20we%20graag%20behouden.',
  title: 'Meer informatie over passagiers- en beroepsvaart',
} as const;

export const varenLegesTableLink: LinkProps = {
  to: 'https://lokaleregelgeving.overheid.nl/CVDR728175#bijlage_1.',
  title: 'Legestabel',
} as const;

const formulierenBaseUrl = `https://formulieren${IS_PRODUCTION ? '' : '.acc'}.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam`;
export const exploitatieVergunningAanvragen: LinkProps = {
  to: `${formulierenBaseUrl}/VARExploitatievergunningAanvragen.aspx`,
  title: 'Exploitatievergunning aanvragen',
} as const;

export const exploitatieVergunningWijzigenLink: (
  key: string,
  title: string
) => LinkProps = (key, title = 'Wijzigen') => ({
  to: `${formulierenBaseUrl}/VARExploitatievergunningWijzigen.aspx?guid=${key}`,
  title,
});

export const ligplaatsVergunningLink: LinkProps = {
  to: `${formulierenBaseUrl}/Ligplaatsbedrijfsvaartuig.aspx`,
  title: 'Ligplaatsvergunning aanvragen',
} as const;

export const rederRegistratieLink: LinkProps = {
  to: `${formulierenBaseUrl}/VARRegistratieReder.aspx`,
  title: 'Onderneming registreren',
} as const;
