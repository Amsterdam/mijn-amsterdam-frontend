import { ReactNode } from 'react';

import { generatePath } from 'react-router-dom';

import styles from './AfisBetaalVoorkeuren.module.scss';
import {
  AfisEMandateFrontend,
  AfisFacturenResponse,
  AfisFactuur,
  AfisFactuurState,
} from '../../../server/services/afis/afis-types';
import { AppRoutes } from '../../../universal/config/routes';
import { LinkProps } from '../../../universal/types/App.types';
import { DisplayProps } from '../../components/Table/TableV2';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';

// Themapagina
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_OPEN = 5;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_TRANSFERRED =
  MAX_TABLE_ROWS_ON_THEMA_PAGINA;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_CLOSED = MAX_TABLE_ROWS_ON_THEMA_PAGINA;

const displayPropsFacturenOpen: DisplayProps<AfisFactuurFrontend> = {
  afzender: 'Afzender',
  factuurNummerEl: 'Factuurnummer',
  paymentDueDateFormatted: 'Vervaldatum',
  statusDescription: 'Status',
};

const displayPropsFacturenAfgehandeld: DisplayProps<AfisFactuurFrontend> = {
  afzender: 'Afzender',
  factuurNummerEl: 'Factuurnummer',
  statusDescription: 'Status',
};

const displayPropsFacturenOvergedragen: DisplayProps<AfisFactuurFrontend> = {
  afzender: 'Afzender',
  factuurNummerEl: 'Factuurnummer',
  statusDescription: 'Status',
};

export const listPageTitle: Record<AfisFactuurState, string> = {
  open: 'Openstaande facturen',
  afgehandeld: 'Afgehandelde facturen',
  overgedragen:
    'Facturen in het incasso- en invorderingstraject van directie Belastingen',
};

export type AfisFactuurFrontend = AfisFactuur & {
  factuurNummerEl: ReactNode;
};

export type AfisFacturenResponseFrontend = AfisFacturenResponse & {
  facturen: AfisFactuurFrontend[];
};

export type AfisFacturenByStateFrontend = {
  [key in AfisFactuurState]?: AfisFacturenResponseFrontend;
};

type AfisFacturenTableConfig = {
  title: string;
  subTitle?: ReactNode;
  displayProps: DisplayProps<AfisFactuurFrontend>;
  maxItems: number;
  listPageLinkLabel: string;
  listPageRoute: string;
  className: string;
};

type AfisFacturenTableConfigByState = Record<
  AfisFactuurState,
  AfisFacturenTableConfig
>;

export const facturenTableConfig: AfisFacturenTableConfigByState = {
  open: {
    title: listPageTitle.open,
    displayProps: displayPropsFacturenOpen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_OPEN,
    listPageLinkLabel: 'Alle openstaande facturen',
    listPageRoute: generatePath(AppRoutes['AFIS/FACTUREN'], {
      state: 'open',
    }),
    className: 'FacturenTable--open',
  },
  overgedragen: {
    title: listPageTitle.overgedragen,
    displayProps: displayPropsFacturenOvergedragen,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_TRANSFERRED,
    listPageLinkLabel:
      'Alle facturen in het incasso- en invorderingstraject van directie Belastingen',
    listPageRoute: generatePath(AppRoutes['AFIS/FACTUREN'], {
      state: 'overgedragen',
    }),
    className: 'FacturenTable--afgehandeld',
  },
  afgehandeld: {
    title: listPageTitle.afgehandeld,
    displayProps: displayPropsFacturenAfgehandeld,
    maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_CLOSED,
    listPageLinkLabel: 'Alle afgehandelde facturen',
    listPageRoute: generatePath(AppRoutes['AFIS/FACTUREN'], {
      state: 'afgehandeld',
    }),
    className: 'FacturenTable--overgedragen',
  },
} as const;

// ==================
// E-Mandates

export type WithActionButtons<T> = T & { action: ReactNode };

// Betaalvoorkeuren
const displayPropsEMandates: DisplayProps<
  WithActionButtons<AfisEMandateFrontend>
> = {
  acceptant: 'Incassant',
  senderName: 'Naam rekeninghouder',
  senderIBAN: 'Van bankrekeningnummer',
  displayStatus: 'Status',
  action: 'Actie',
};

export const businessPartnerDetailsLabels = {
  fullName: 'Debiteurnaam',
  businessPartnerId: 'Debiteurnummer',
  email: 'E-mailadres factuur',
  phone: 'Telefoonnummer',
  address: 'Adres',
};

export const eMandateTableConfig = {
  title: `Automatische incasso's`,
  displayProps: displayPropsEMandates,
  className: styles.EMandatesTable,
} as const;

export const routes = {
  listPageFacturen: AppRoutes['AFIS/FACTUREN'],
  betaalVoorkeuren: AppRoutes['AFIS/BETAALVOORKEUREN'],
  themaPage: AppRoutes.AFIS,
} as const;

export const linkListItemsThemaPagina: LinkProps[] = [
  {
    to: 'https://www.amsterdam.nl/ondernemen/afis/facturen/',
    title: 'Meer over facturen van de gemeente',
  },
  {
    to: import.meta.env.REACT_APP_SSO_URL_BELASTINGEN,
    title: 'Belastingen op Mijn Amsterdam',
  },
];

export const linkListItemsBetaalvoorkeurenPagina: LinkProps[] = [
  {
    to: 'https://www.amsterdam.nl/veelgevraagd/facturen-van-de-gemeente-controleren-gegevens-wijzigen-automatische-incasso-regelen-38caa',
    title: 'Meer over betalen aan de gemeente',
  },
];
