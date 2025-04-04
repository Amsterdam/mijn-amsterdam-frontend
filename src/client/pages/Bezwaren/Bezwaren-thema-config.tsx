import { generatePath } from 'react-router';

import { Bezwaar } from '../../../server/services/bezwaren/types';
import { AppRoutes } from '../../../universal/config/routes';
import { LinkProps } from '../../../universal/types/App.types';
import { withOmitDisplayPropsForSmallScreens } from '../../components/Table/helpers';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../components/Table/TableV2';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';
import { TrackingConfig } from '../../config/routes';

const MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND = 5;

export const LinkListItems: LinkProps[] = [
  {
    title: 'Meer informatie over Bezwaar maken',
    to: 'https://www.amsterdam.nl/veelgevraagd/bezwaar-maken-tegen-een-besluit-van-de-gemeente-amsterdam-e5898',
  },
];

const displayPropsBezwarenBase: DisplayProps<WithDetailLinkComponent<Bezwaar>> =
  {
    detailLinkComponent: 'Zaaknummer',
    ontvangstdatumFormatted: 'Ontvangen op',
    omschrijving: 'Onderwerp',
  };

const displayPropsBezwaren = withOmitDisplayPropsForSmallScreens(
  displayPropsBezwarenBase,
  ['omschrijving', 'ontvangstdatumFormatted']
);

export const routes = {
  listPage: AppRoutes['BEZWAREN/LIST'],
  detailPageVergunning: AppRoutes['BEZWAREN/DETAIL'],
  themaPage: AppRoutes.BEZWAREN,
} as const;

export const listPageParamKind = {
  lopend: 'lopende-bezwaren',
  afgehandeld: 'afgehandelde-bezwaren',
} as const;

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const tableConfig = {
  [listPageParamKind.lopend]: {
    title: 'Lopende bezwaren',
    filter: (bezwaar: Bezwaar) => bezwaar.status !== 'Afgehandeld',
    displayProps: displayPropsBezwaren,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
    textNoContent:
      'U heeft geen lopende zaken. Het kan zijn dat een ingediend bezwaar nog niet is geregistreerd.',
    listPageRoute: generatePath(routes.listPage, {
      kind: listPageParamKind.lopend,
      page: null,
    }),
  },
  [listPageParamKind.afgehandeld]: {
    title: 'Afgehandelde bezwaren',
    filter: (bezwaar: Bezwaar) => bezwaar.status === 'Afgehandeld',
    displayProps: displayPropsBezwaren,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
    textNoContent: 'U heeft nog geen afgehandelde bezwaren.',
    listPageRoute: generatePath(routes.listPage, {
      kind: listPageParamKind.afgehandeld,
      page: null,
    }),
  },
} as const;

export function getBezwarenListPageDocumentTitle(themaTitle: string) {
  return <T extends Record<string, string>>(
    config: TrackingConfig,
    params: T | null
  ) => {
    const kind = params?.kind as ListPageParamKind;
    return kind in tableConfig
      ? `${tableConfig[kind].title} | ${themaTitle}`
      : themaTitle;
  };
}
