import { generatePath } from 'react-router-dom';

import { VarenFrontend } from '../../../server/services/varen/config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { dateSort } from '../../../universal/helpers/date';
import { LinkProps } from '../../../universal/types';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../components/Table/TableV2';
import { TrackingConfig } from '../../config/routes';
import { ThemaTitles } from '../../config/thema';

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

export const linkListItems: LinkProps[] = [
  {
    to: 'https://www.amsterdam.nl/verkeer-vervoer/varen-amsterdam/varen-beroepsvaart/#:~:text=De%20passagiersvaart%20in%20Amsterdam%20is,stad%20willen%20we%20graag%20behouden.',
    title: 'Meer informatie over passagiers- en beroepsvaart',
  },
] as const;

export const buttonItems: LinkProps[] = [
  {
    to: 'https://formulieren.acc.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/VARExploitatievergunningAanvragen.aspx',
    title: 'Exploitatievergunning aanvragen',
  },
] as const;

export function getVarenListPageDocumentTitle() {
  return <T extends Record<string, string>>(
    config: TrackingConfig,
    params: T | null
  ) => {
    const kind = params?.kind as ListPageParamKind;
    return kind in tableConfig
      ? `${tableConfig[kind].title} | ${ThemaTitles.VAREN}`
      : ThemaTitles.VAREN;
  };
}
export function getVarenDetailPageDocumentTitle() {
  return <T extends Record<string, string>>(
    config: TrackingConfig,
    params: T | null
  ) => {
    switch (params?.caseType) {
      case 'ligplaatsvergunning':
        return `Ligplaatsvergunning | ${ThemaTitles.VAREN}`;
      case 'exploitatievergunning':
        return `Exploitatievergunning | ${ThemaTitles.VAREN}`;
      default:
        return `Vergunning | ${ThemaTitles.VAREN}`;
    }
  };
}
