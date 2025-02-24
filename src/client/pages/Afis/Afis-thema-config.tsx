import { ReactNode } from 'react';

import { generatePath } from 'react-router-dom';

import {
  AfisBusinessPartnerDetailsTransformed,
  AfisFacturenResponse,
  AfisFactuur,
  AfisFactuurState,
} from '../../../server/services/afis/afis-types';
import { AppRoutes } from '../../../universal/config/routes';
import { LinkProps, ZaakDetail } from '../../../universal/types';
import { DisplayProps } from '../../components/Table/TableV2';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';
import { TrackingConfig } from '../../config/routes';
import { ThemaTitles } from '../../config/thema';

// Themapagina
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_OPEN = 5;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_TRANSFERRED =
  MAX_TABLE_ROWS_ON_THEMA_PAGINA;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_CLOSED = MAX_TABLE_ROWS_ON_THEMA_PAGINA;

const displayPropsFacturenOpen: DisplayProps<AfisFactuurFrontend> = {
  factuurNummerEl: 'Factuurnummer',
  afzender: 'Afzender',
  paymentDueDateFormatted: 'Vervaldatum',
  statusDescription: 'Status',
};

const displayPropsFacturenAfgehandeld: DisplayProps<AfisFactuurFrontend> = {
  factuurNummerEl: 'Factuurnummer',
  afzender: 'Afzender',
  statusDescription: 'Status',
};

const displayPropsFacturenOvergedragen: DisplayProps<AfisFactuurFrontend> = {
  factuurNummerEl: 'Factuurnummer',
  afzender: 'Afzender',
  statusDescription: 'Status',
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

export const routes = {
  listPageFacturen: AppRoutes['AFIS/FACTUREN'],
  betaalVoorkeuren: AppRoutes['AFIS/BETAALVOORKEUREN'],
  themaPage: AppRoutes.AFIS,
} as const;

export const linkListItems: LinkProps[] = [
  {
    to: 'https://www.amsterdam.nl/veelgevraagd/facturen-van-de-gemeente-controleren-gegevens-wijzigen-automatische-incasso-regelen-38caa',
    title: 'Meer over betalen aan de gemeente',
  },
];

export function getAfisListPageDocumentTitle() {
  return <T extends Record<string, string>>(
    config: TrackingConfig,
    params: T | null
  ) => {
    switch (params?.state) {
      case 'open':
        return `Open facturen | ${ThemaTitles.AFIS}`;
      case 'afgehandeld':
        return `Afgehandelde facturen | ${ThemaTitles.AFIS}`;
      case 'overgedragen':
        return `Overgedragen aan belastingen facturen | ${ThemaTitles.AFIS}`;
      default:
        return `Facturen | ${ThemaTitles.AFIS}`;
    }
  };
}
