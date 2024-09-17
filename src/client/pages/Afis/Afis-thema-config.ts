import { ReactNode } from 'react';
import { AppRoutes } from '../../../universal/config/routes';
import { ZaakDetail } from '../../../universal/types';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';
import { AfisFactuur } from '../../../server/services/afis/afis-types';
import { DisplayProps } from '../../components/Table/TableV2';

export type AfisEmandateStub = ZaakDetail & Record<string, string>;

export type AfisFactuurFrontend = AfisFactuur & {
  statusDescription: string;
  factuurNummerEl: ReactNode;
};

// Themapagina
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_OPEN = 5;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_CLOSED = MAX_TABLE_ROWS_ON_THEMA_PAGINA;

const displayPropsFacturen: DisplayProps<AfisFactuurFrontend> = {
  afzender: 'Afzender',
  factuurNummer: 'Factuurnummer',
  statusDescription: 'Status',
  paymentDueDateFormatted: 'Vervaldatum',
};

export const listPageParamKind = {
  open: 'open',
  closed: 'closed',
} as const;

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const listPageTitle = {
  [listPageParamKind.open]: 'Openstaande facturen',
  [listPageParamKind.closed]: 'Afgehandelde facturen',
} as const;

export const facturenTableConfig = {
  [listPageParamKind.open]: {
    title: listPageTitle[listPageParamKind.open],
    displayProps: displayPropsFacturen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_OPEN,
  },
  [listPageParamKind.closed]: {
    title: listPageTitle[listPageParamKind.closed],
    displayProps: displayPropsFacturen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_CLOSED,
  },
} as const;

// Betaalvoorkeuren
const displayPropsEmandates: DisplayProps<AfisEmandateStub> = {
  name: 'Naam',
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

export const routes = {
  listPageFacturen: AppRoutes['AFIS/FACTUREN'],
  betaalVoorkeuren: AppRoutes['AFIS/BETAALVOORKEUREN'],
  themaPage: AppRoutes.AFIS,
} as const;
