import { ReactNode } from 'react';
import { AppRoutes } from '../../../universal/config/routes';
import { ZaakDetail } from '../../../universal/types';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';
import {
  AfisFacturenByStateResponse,
  AfisFactuur,
  AfisFactuurState,
} from '../../../server/services/afis/afis-types';
import { DisplayProps } from '../../components/Table/TableV2';

export type AfisEmandateStub = ZaakDetail & Record<string, string>;

export type AfisFactuurFrontend = AfisFactuur & {
  factuurNummerEl: ReactNode;
};

export type AfisFacturenByStateFrontend = {
  [key in keyof AfisFacturenByStateResponse]: AfisFactuurFrontend[];
};

// Themapagina
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_OPEN = 5;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_TRANSFERRED = 5;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_CLOSED = MAX_TABLE_ROWS_ON_THEMA_PAGINA;

const displayPropsFacturen: DisplayProps<AfisFactuurFrontend> = {
  afzender: 'Afzender',
  factuurNummerEl: 'Factuurnummer',
  statusDescription: 'Status',
  paymentDueDateFormatted: 'Vervaldatum',
};

export const listPageParamState: {
  [key in AfisFactuurState]: AfisFactuurState;
} = {
  open: 'open',
  closed: 'closed',
  transferred: 'transferred',
};

export type ListPageParamStateKey = keyof typeof listPageParamState;
export type ListPageParamState =
  (typeof listPageParamState)[ListPageParamStateKey];

export const listPageTitle = {
  [listPageParamState.open]: 'Openstaande facturen',
  [listPageParamState.closed]: 'Afgehandelde facturen',
  [listPageParamState.transferred]: 'Overgedragen facturen',
} as const;

export const facturenTableConfig = {
  [listPageParamState.open]: {
    title: listPageTitle[listPageParamState.open],
    subTitle:
      'De betaalstatus kan 3 werkdagen achterlopen op de doorgevoerde wijzigingen.',
    displayProps: displayPropsFacturen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_OPEN,
    listPageLinkLabel: 'Alle openstaande facturen',
  },
  [listPageParamState.closed]: {
    title: listPageTitle[listPageParamState.closed],
    displayProps: displayPropsFacturen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_CLOSED,
    listPageLinkLabel: 'Alle afgehandelde facturen',
  },
  [listPageParamState.transferred]: {
    title: listPageTitle[listPageParamState.transferred],
    displayProps: displayPropsFacturen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_TRANSFERRED,
    listPageLinkLabel: 'Alle afgehandelde facturen',
  },
} as const;

// Betaalvoorkeuren
const displayPropsEmandates: DisplayProps<AfisEmandateStub> = {
  name: 'Naam',
};

export const businessPartnerDetailsLabels = {
  fullName: 'Debiteurnaam',
  businessPartnerId: 'Debiteurnummer',
  email: 'E-mailadres factuur',
  phone: 'Telefoonnummer',
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
