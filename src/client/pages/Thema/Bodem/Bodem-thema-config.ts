import { generatePath } from 'react-router';

import { LoodMetingFrontend } from '../../../../server/services/bodem/types';
import { dateSort } from '../../../../universal/helpers/date';
import { DisplayProps } from '../../../components/Table/TableV2.types';
import {
  MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
} from '../../../config/app';
import { ThemaConfig } from '../../../config/thema-types';
import type { ThemaRoutesConfig } from '../../../config/thema-types';

export const themaConfig: ThemaConfig = {
  id: 'BODEM',
  title: 'Bodem',
  titleDetail: 'Lood in bodem-check',
  linkListItems: [
    {
      to: 'https://www.amsterdam.nl/wonen-bouwen-verbouwen/bodem/loodcheck-tuin-aanvragen',
      title: 'Meer informatie over lood in de bodem.',
    },
  ],
  listPageParamKind: {
    inProgress: 'lopende-aanvragen',
    completed: 'afgehandelde-aanvragen',
  },
  featureToggle: true,
  uitlegPageSections: {
    SectionProps: {
      id: 'BODEM',
      title: 'Bodem',
      listItems: ["Uw aanvraag voor 'lood in de bodem-check'"],
      active: true,
    },
  },
};

// const listPageParamKind = {
//   inProgress: 'lopende-aanvragen',
//   completed: 'afgehandelde-aanvragen',
// } as const;

// export const featureToggle = {
//   BodemActive: true,
// };

//export const themaId = 'BODEM' as const;
//export const themaTitle = 'Bodem';
//export const themaTitleDetail = 'Lood in bodem-check';

export const routeConfig = {
  detailPage: {
    path: '/bodem/lood-meting/:id',
    trackingUrl: '/bodem/lood-meting',
    documentTitle: `Lood in de bodem-check | ${themaConfig.title}`,
  },
  listPage: {
    path: '/bodem/lijst/lood-meting/:kind/:page?',
    documentTitle: (params) =>
      `${params?.kind === themaConfig.listPageParamKind.completed ? 'Afgehandelde' : 'Lopende'} aanvragen | ${themaConfig.title}`,
  },
  themaPage: {
    path: '/bodem',
    documentTitle: `${themaConfig.title} | overzicht`,
  },
} as const satisfies ThemaRoutesConfig;

export type ListPageParamKey = keyof typeof themaConfig.listPageParamKind;
export type ListPageParamKind =
  (typeof themaConfig.listPageParamKind)[ListPageParamKey];

const displayPropsLopend: DisplayProps<LoodMetingFrontend> = {
  props: {
    detailLinkComponent: 'Adres',
    datumAanvraagFormatted: 'Aangevraagd op',
    displayStatus: 'Status',
  },
  colWidths: {
    large: ['25%', '25%', '50%'],
    small: ['100%', '0', '0'],
  },
};

const displayPropsEerder: DisplayProps<LoodMetingFrontend> = {
  props: {
    detailLinkComponent: 'Adres',
    datumAfgehandeldFormatted: 'Afgehandeld op',
    decision: 'Resultaat',
  },
  colWidths: {
    large: ['25%', '25%', '50%'],
    small: ['100%', '0', '0'],
  },
};

export const tableConfig = {
  [themaConfig.listPageParamKind.inProgress]: {
    title: 'Lopende aanvragen',
    sort: dateSort<LoodMetingFrontend>('datumAanvraag', 'desc'),
    filter: (bodemAanvraag: LoodMetingFrontend) => !bodemAanvraag.processed,
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: themaConfig.listPageParamKind.inProgress,
      page: null,
    }),
    displayProps: displayPropsLopend,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_LOPEND,
  },
  [themaConfig.listPageParamKind.completed]: {
    title: 'Afgehandelde aanvragen',
    sort: dateSort<LoodMetingFrontend>('datumAfgehandeld', 'desc'),
    filter: (bodemAanvraag: LoodMetingFrontend) => bodemAanvraag.processed,
    listPageRoute: generatePath(routeConfig.listPage.path, {
      kind: themaConfig.listPageParamKind.completed,
      page: null,
    }),
    displayProps: displayPropsEerder,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  },
} as const;

// export const linkListItems: LinkProps[] = [
//   {
//     title: 'Meer informatie over lood in de bodem.',
//     to: 'https://www.amsterdam.nl/wonen-bouwen-verbouwen/bodem/loodcheck-tuin-aanvragen',
//   },
// ] as const;
