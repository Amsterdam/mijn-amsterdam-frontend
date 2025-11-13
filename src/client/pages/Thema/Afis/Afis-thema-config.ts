import { ReactNode } from 'react';

import { generatePath, type Params } from 'react-router';

import type {
  AfisBusinessPartnerDetailsTransformed,
  AfisEMandateFrontend,
  AfisFacturenResponse,
  AfisFactuur,
  AfisFactuurStateFrontend,
  AfisFactuurTermijn,
} from '../../../../server/services/afis/afis-types';
import { IS_PRODUCTION } from '../../../../universal/config/env';
import type { LinkProps } from '../../../../universal/types/App.types';
import type { DisplayProps } from '../../../components/Table/TableV2.types';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../../config/app';
import type { ThemaRoutesConfig } from '../../../config/thema-types';

export const featureToggle = {
  AfisActive: true,
  afisEMandatesActive: !IS_PRODUCTION,
};

// E-Mandates are always recurring and have a default date far in the future!
export const EMANDATE_ENDDATE_INDICATOR = '9999';

export const themaId = 'AFIS' as const;
export const themaTitle = 'Facturen en betalen';

export const titleBetaalvoorkeurenPage = 'Betaalvoorkeuren';
export const titleEMandaatPage = 'E-Mandaat';

export const routeConfig = {
  detailPage: {
    path: '/facturen-en-betalen/factuur/:state/:factuurNummer',
    documentTitle: `Factuurgegevens | ${themaTitle}`,
    trackingUrl: null,
  },
  betaalVoorkeuren: {
    path: '/facturen-en-betalen/betaalvoorkeuren',
    documentTitle: `Betaalvoorkeuren | ${themaTitle}`,
    trackingUrl: null,
  },
  detailPageEMandate: {
    path: '/facturen-en-betalen/betaalvoorkeuren/emandate/:id',
    documentTitle: `E-Mandaat | ${themaTitle}`,
    trackingUrl: null,
  },
  listPage: {
    path: '/facturen-en-betalen/facturen/lijst/:state/:page?',
    documentTitle: getAfisListPageDocumentTitle,
    trackingUrl: null,
  },
  themaPage: {
    path: '/facturen-en-betalen',
    documentTitle: `${themaTitle} | overzicht`,
    trackingUrl: null,
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
    large: ['15%', '25%', '25%', '35%'],
    small: ['25%', '0', '0', '75%'],
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

export const displayPropsTermijnenTable: DisplayProps<AfisFactuurTermijn> = {
  props: {
    term: 'Termijn',
    paymentDueDateFormatted: 'Vervaldatum',
    amountOriginalFormatted: 'Bedrag',
    paymentStatus: 'Status',
    statusDescription: 'Termijn',
  },
  colWidths: {
    large: ['10%', '25%', '20%', '45%', '0'],
    small: ['0', '0', '0', '0', '100%'],
  },
};

export const listPageTitle: Record<AfisFactuurStateFrontend, string> = {
  open: 'Openstaande facturen',
  afgehandeld: 'Afgehandelde facturen',
  overgedragen:
    'Facturen in het incasso- en invorderingstraject van directie Belastingen',
};

export type AfisFactuurFrontend = Omit<AfisFactuur, 'statusDescription'> & {
  factuurNummerEl: ReactNode;
  statusDescription: ReactNode;
};

export type AfisFacturenResponseFrontend = Omit<
  AfisFacturenResponse,
  'facturen'
> & {
  facturen: AfisFactuurFrontend[];
};

export type AfisFacturenByStateFrontend = {
  [key in AfisFactuurStateFrontend]?: AfisFacturenResponseFrontend;
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

export const businessPartnerDetailsLabels: DisplayProps<AfisBusinessPartnerDetailsTransformed> =
  {
    fullName: 'Debiteurnaam',
    businessPartnerId: 'Debiteurnummer',
    email: 'E-mailadres factuur',
    phone: 'Telefoonnummer',
    fullAddress: 'Adres',
  };

const displayPropsEMandates: DisplayProps<AfisEMandateFrontend> = {
  detailLinkComponent: 'Afdeling gemeente',
  displayStatus: 'Status',
};

export const eMandateTableConfig = {
  title: `Automatische incasso's`,
  displayProps: displayPropsEMandates,
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

export const EMANDATE_STATUS_ACTIVE = '1';
