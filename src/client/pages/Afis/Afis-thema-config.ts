import { ReactNode } from 'react';
import { AppRoutes } from '../../../universal/config/routes';
import { ZaakDetail } from '../../../universal/types';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';
import {
  AfisFacturenByStateResponse,
  AfisFacturenResponse,
  AfisFactuur,
  AfisFactuurState,
} from '../../../server/services/afis/afis-types';
import { DisplayProps } from '../../components/Table/TableV2';
import { generatePath } from 'react-router-dom';

export type AfisEmandateStub = ZaakDetail & Record<string, string>;

export type AfisFactuurFrontend = AfisFactuur & {
  factuurNummerEl: ReactNode;
};

export type AfisFacturenResponseFrontend = AfisFacturenResponse & {
  facturen: AfisFactuurFrontend[];
};

export type AfisFacturenByStateFrontend = {
  [key in keyof AfisFacturenByStateResponse]: AfisFacturenResponseFrontend;
};

// Themapagina
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_OPEN = 5;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_TRANSFERRED =
  MAX_TABLE_ROWS_ON_THEMA_PAGINA;
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
  afgehandeld: 'afgehandeld',
  overgedragen: 'overgedragen',
};

export type ListPageParamStateKey = keyof typeof listPageParamState;
export type ListPageParamState =
  (typeof listPageParamState)[ListPageParamStateKey];

export const listPageTitle = {
  [listPageParamState.open]: 'Openstaande facturen',
  [listPageParamState.afgehandeld]: 'Afgehandelde facturen',
  [listPageParamState.overgedragen]: 'Overgedragen facturen',
} as const;

export const facturenTableConfig = {
  [listPageParamState.open]: {
    title: listPageTitle[listPageParamState.open],
    subTitle:
      'De betaalstatus kan 3 werkdagen achterlopen op de doorgevoerde wijzigingen.',
    displayProps: displayPropsFacturen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_OPEN,
    listPageLinkLabel: 'Alle openstaande facturen',
    listPageRoute: generatePath(AppRoutes['AFIS/FACTUREN'], {
      state: listPageParamState.open,
    }),
  },
  [listPageParamState.afgehandeld]: {
    title: listPageTitle[listPageParamState.afgehandeld],
    displayProps: displayPropsFacturen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_CLOSED,
    listPageLinkLabel: 'Alle afgehandelde facturen',
    listPageRoute: generatePath(AppRoutes['AFIS/FACTUREN'], {
      state: listPageParamState.afgehandeld,
    }),
  },
  [listPageParamState.overgedragen]: {
    title: listPageTitle[listPageParamState.overgedragen],
    displayProps: displayPropsFacturen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_TRANSFERRED,
    listPageLinkLabel: 'Alle afgehandelde facturen',
    listPageRoute: generatePath(AppRoutes['AFIS/FACTUREN'], {
      state: listPageParamState.overgedragen,
    }),
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
