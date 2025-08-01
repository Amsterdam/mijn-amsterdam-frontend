import { ReactNode } from 'react';

import { generatePath, type Params } from 'react-router';

import {
  AfisBusinessPartnerDetailsTransformed,
  AfisFacturenResponse,
  AfisFactuur,
  AfisFactuurState,
} from '../../../../server/services/afis/afis-types';
import { LinkProps, ZaakDetail } from '../../../../universal/types/App.types';
import { DisplayProps } from '../../../components/Table/TableV2.types';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../../config/app';
import type { ThemaRoutesConfig } from '../../../config/thema-types';

export const featureToggle = {
  AfisActive: true,
};

export const themaId = 'AFIS' as const;
export const themaTitle = 'Facturen en betalen';

export const routeConfig = {
  detailPage: {
    path: '/facturen-en-betalen/betaalvoorkeuren',
    documentTitle: `Betaalvoorkeuren | ${themaTitle}`,
  },
  listPage: {
    path: '/facturen-en-betalen/facturen/lijst/:state/:page?',
    documentTitle: getAfisListPageDocumentTitle,
  },
  themaPage: {
    path: '/facturen-en-betalen',
    documentTitle: `${themaTitle} | overzicht`,
  },
} as const satisfies ThemaRoutesConfig;

// Themapagina
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_OPEN = 5;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_TRANSFERRED =
  MAX_TABLE_ROWS_ON_THEMA_PAGINA;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_CLOSED = MAX_TABLE_ROWS_ON_THEMA_PAGINA;

const displayPropsFacturenOpen: DisplayProps<AfisFactuurFrontend> = {
  props: {
    factuurNummerEl: 'Factuurnummer',
    afzender: 'Afzender',
    paymentDueDateFormatted: 'Vervaldatum',
    statusDescription: 'Status',
  },
  colWidths: {
    large: ['25%', '20%', '20%', '35%'],
    small: ['100%', '0', '0', '0'],
  },
};

const displayPropsFacturenAfgehandeldOfOvergedragen: DisplayProps<AfisFactuurFrontend> =
  {
    props: {
      factuurNummerEl: 'Factuurnummer',
      afzender: 'Afzender',
      statusDescription: 'Status',
    },
    colWidths: {
      large: ['25%', '25%', '50%'],
      small: ['100%', '0', '0'],
    },
  };

export const listPageTitle: Record<AfisFactuurState, string> = {
  open: 'Openstaande facturen',
  afgehandeld: 'Afgehandelde facturen',
  overgedragen:
    'Facturen in het incasso- en invorderingstraject van directie Belastingen',
};

export type AfisEmandateStub = ZaakDetail & Record<string, string>;

export type AfisFactuurFrontend = AfisFactuur & {
  factuurNummerEl: ReactNode;
};

export type AfisFacturenResponseFrontend = AfisFacturenResponse & {
  facturen: AfisFactuurFrontend[];
};

export type AfisFacturenByStateFrontend = {
  [key in AfisFactuurState]?: AfisFacturenResponseFrontend;
};

export const facturenTableConfig = {
  open: {
    title: listPageTitle.open,
    displayProps: displayPropsFacturenOpen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_OPEN,
    listPageLinkLabel: 'Alle openstaande facturen',
    listPageRoute: generatePath(routeConfig.listPage.path, {
      state: 'open',
      page: null,
    }),
  },
  overgedragen: {
    title: listPageTitle.overgedragen,
    displayProps: displayPropsFacturenAfgehandeldOfOvergedragen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_TRANSFERRED,
    listPageLinkLabel:
      'Alle facturen in het incasso- en invorderingstraject van directie Belastingen',
    listPageRoute: generatePath(routeConfig.listPage.path, {
      state: 'overgedragen',
      page: null,
    }),
  },
  afgehandeld: {
    title: listPageTitle.afgehandeld,
    displayProps: displayPropsFacturenAfgehandeldOfOvergedragen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_CLOSED,
    listPageLinkLabel: 'Alle afgehandelde facturen',
    listPageRoute: generatePath(routeConfig.listPage.path, {
      state: 'afgehandeld',
      page: null,
    }),
  },
} as const;

// Betaalvoorkeuren
const displayPropsEmandates: DisplayProps<AfisEmandateStub> = {
  name: 'Naam',
};

export const businessPartnerDetailsLabels: DisplayProps<AfisBusinessPartnerDetailsTransformed> =
  {
    fullName: 'Debiteurnaam',
    businessPartnerId: 'Debiteurnummer',
    email: 'E-mailadres factuur',
    phone: 'Telefoonnummer',
    address: 'Adres',
  };

export const eMandateTableConfig = {
  active: {
    title: `Actieve automatische incasso's`,
    filter: (emandate: AfisEmandateStub) => emandate.isActive,
    displayProps: displayPropsEmandates,
  },
  inactive: {
    title: `Niet actieve automatische incasso's`,
    filter: (emandate: AfisEmandateStub) => !emandate.isActive,
    displayProps: displayPropsEmandates,
  },
} as const;

export const linkListItems: LinkProps[] = [
  {
    to: 'https://www.amsterdam.nl/veelgevraagd/facturen-van-de-gemeente-controleren-gegevens-wijzigen-automatische-incasso-regelen-38caa',
    title: 'Meer over betalen aan de gemeente',
  },
];

export function getAfisListPageDocumentTitle<T extends Params<string>>(
  params: T | null
) {
  switch (params?.state) {
    case 'open':
      return `Open facturen | ${themaTitle}`;
    case 'afgehandeld':
      return `Afgehandelde facturen | ${themaTitle}`;
    case 'overgedragen':
      return `Overgedragen aan belastingen facturen | ${themaTitle}`;
    default:
      return `Facturen | ${themaTitle}`;
  }
}
