import { generatePath } from 'react-router';

import type { IdentiteitsbewijsFrontend } from '../../../../server/services/profile/brp.types';
import { dateSort } from '../../../../universal/helpers/date';
import { LinkProps } from '../../../../universal/types/App.types';
import { withOmitDisplayPropsForSmallScreens } from '../../../components/Table/helpers';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../../components/Table/TableV2.types';
import type { ThemaRoutesConfig } from '../../../config/thema-types';

const displayPropsBase: DisplayProps<
  WithDetailLinkComponent<IdentiteitsbewijsFrontend>
> = {
  detailLinkComponent: 'Type',
  datumAfloopFormatted: 'Geldig tot',
};

export const listPageParamKind = {
  identiteitsbewijzen: 'identiteitsbewijzen',
} as const;

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const featureToggle = {
  burgerzakenActive: true,
};

export const themaId = 'BURGERZAKEN' as const;
export const themaTitle = 'Paspoort en ID-kaart';

export const routeConfig = {
  detailPage: {
    path: '/paspoort-en-id-kaart/:documentType/:id',
    trackingUrl: '/burgerzaken/identiteitsbewijs',
    documentTitle: `Burgerzaken | ${themaTitle}`,
  },
  listPage: {
    path: '/paspoort-en-id-kaart/lijst/:kind/:page?',
    documentTitle: (params) =>
      `${params?.documentType === 'paspoort' ? 'Paspoort' : 'ID-kaart'} | ${themaTitle}`,
  },
  themaPage: {
    path: '/paspoort-en-id-kaart',
    documentTitle: `${themaTitle} | overzicht`,
  },
} as const satisfies ThemaRoutesConfig;

const displayProps = withOmitDisplayPropsForSmallScreens(displayPropsBase, [
  'datumAfloopFormatted',
]);

export const tableConfig = {
  [listPageParamKind.identiteitsbewijzen]: {
    title: 'Identiteitsbewijzen',
    displayProps,
    sort: dateSort('datumAfloop', 'desc'),
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: listPageParamKind.identiteitsbewijzen,
      page: null,
    }),
  },
} as const;

export const linkListItems: LinkProps[] = [
  {
    to: 'https://www.amsterdam.nl/burgerzaken',
    title: 'Overzicht en aanvragen bij burgerzaken',
  },
] as const;
