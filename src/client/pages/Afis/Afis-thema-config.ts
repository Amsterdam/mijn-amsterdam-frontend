import { ReactNode } from 'react';
import { AppRoutes } from '../../../universal/config/routes';
import { ZaakDetail } from '../../../universal/types';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';
import { AfisFactuur } from '../../../server/services/afis/afis-types';

export type AfisEmandateStub = ZaakDetail & Record<string, string>;

// Themapagina
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_OPEN = 5;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_CLOSED = MAX_TABLE_ROWS_ON_THEMA_PAGINA;

const displayPropsFacturen = {
  afzender: 'Afzender',
  factuurNummer: 'Factuurnummer',
  status: 'Status',
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
const displayPropsEmandates = {
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
