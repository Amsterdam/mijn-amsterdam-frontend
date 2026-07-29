import type { ReactNode } from 'react';

import { generatePath } from 'react-router';

import type {
  ErfpachtDossierFrontend,
  ErfpachtResponseFrontend,
} from '../../../../server/services/erfpacht/erfpacht-types.ts';
import type { ErfpachtZaakExcerptFrontend } from '../../../../server/services/erfpacht/erfpacht-zaken-types.ts';
import { IS_PRODUCTION } from '../../../../universal/config/env.ts';
import type { DisplayProps } from '../../../components/Table/TableV2.types.ts';
import {
  isEnabled,
  propagateFeatureToggles,
} from '../../../config/feature-toggles.ts';
import type {
  PageConfig,
  ThemaConfigBase,
} from '../../../config/thema-types.ts';
import {
  getAfisListPageDocumentTitle,
  getFacturenTableConfig,
} from '../Afis/Afis-thema-config.ts';

// Themapagina
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_DOSSIERS = 5;

const THEMA_ID = 'ERFPACHT';
const THEMA_TITLE = 'Erfpacht';
export const ERFPACHT_ZAKELIJK_ROUTE_DEFAULT =
  'https://erfpachtzakelijk.amsterdam.nl';

export const LINKS = {
  algemeneBepalingen:
    'https://www.amsterdam.nl/wonen-leefomgeving/erfpacht/wat-is-erfpacht/algemene-bepalingen/',
  overstappenEewigdurendeErfpacht:
    'https://www.amsterdam.nl/wonen-leefomgeving/erfpacht/overstappen-eeuwigdurende-erfpacht/',
  erfpachtWijzigenForm: `https://formulieren${IS_PRODUCTION ? '' : '.acc'}.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/ErfpachtWijzigen.aspx`,
};

type WithDetailPageFactuur = PageConfig<'detailPageFactuur'>;
type WithListPageFacturen = PageConfig<'listPageFacturen'>;
type WithListPageZaken = PageConfig<'listPageZaken'>;
type WithListPageDossiers = PageConfig<'listPageDossiers'>;
type WithDetailPageZaak = PageConfig<'detailPageZaak'>;
type WithDetailPageDossier = PageConfig<'detailPageDossier'>;

type ThemaConfigErfpacht = ThemaConfigBase &
  WithDetailPageDossier &
  WithDetailPageZaak &
  WithListPageDossiers &
  WithDetailPageFactuur &
  WithListPageFacturen &
  WithDetailPageFactuur &
  WithListPageFacturen &
  WithListPageZaken;

export const themaConfig = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  redactedScope: 'none',
  profileTypes: ['private'], //COMMERCIAL IS IN ERFPACHT-RENDER-CONFIG, BECAUSE HAS ANOTHER MENUITEM
  featureToggle: propagateFeatureToggles({
    active: true,
    canonmatigingLinkActive: true,
    wijzigingsaanvragenActive: isEnabled('ERFPACHT.wijzigingsaanvragen'),
  }),
  pageLinks: [
    {
      to: 'https://www.amsterdam.nl/wonen-leefomgeving/erfpacht/',
      title: 'Meer informatie over erfpacht in Amsterdam',
    },
    {
      to: LINKS.erfpachtWijzigenForm,
      title: 'Erfpacht wijzigen',
    },
    {
      to: LINKS.overstappenEewigdurendeErfpacht,
      title: 'Overstappen erfpachtrecht',
    },
  ],
  uitlegPageSections: [
    {
      title: THEMA_TITLE,
      listItems: ['Overzicht van uw erfpachtgegevens'],
    },
  ],
  route: {
    path: '/erfpacht',
    documentTitle: `${THEMA_TITLE} | overzicht`,
    trackingUrl: null,
  },
  detailPageDossier: {
    route: {
      path: '/erfpacht/dossier/:dossierId',
      trackingUrl: '/erfpacht/dossier',
      documentTitle: `Erfpachtdossier | ${THEMA_TITLE}`,
    },
  },
  detailPageZaak: {
    route: {
      path: '/erfpacht/zaak/:uuid',
      trackingUrl: '/erfpacht/zaak',
      documentTitle: `Erfpacht wijzigingsaanvraag | ${THEMA_TITLE}`,
    },
  },
  listPageDossiers: {
    route: {
      path: '/erfpacht/dossiers/:page?',
      documentTitle: `Lijst met dossiers | ${THEMA_TITLE}`,
      trackingUrl: null,
    },
  },
  listPageZaken: {
    route: {
      path: '/erfpacht/zaken/:page?',
      documentTitle: `Lijst met zaken | ${THEMA_TITLE}`,
      trackingUrl: null,
    },
  },
  detailPageFactuur: {
    route: {
      path: '/erfpacht/factuur/:state/:factuurNummer',
      documentTitle: `Factuurgegevens | ${THEMA_TITLE}`,
      trackingUrl: null,
    },
  },
  listPageFacturen: {
    route: {
      path: '/erfpacht/facturen/lijst/:state/:page?',
      documentTitle: getAfisListPageDocumentTitle,
      trackingUrl: null,
    },
  },
} as const satisfies ThemaConfigErfpacht;

export const listPageParamKind = {
  erfpachtDossiers: 'erfpacht-dossiers',
  erfpachtZaken: 'erfpacht-zaken',
  erfpachtDossierDetailZaken: 'erfpacht-dossier-detail-zaken',
} as const;

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const erfpachtFacturenTableConfig = getFacturenTableConfig({
  listPagePath: themaConfig.listPageFacturen.route.path,
  mergeConfig: {
    open: {
      title: 'Openstaande erfpachtfacturen',
      displayProps: {
        colWidths: {
          large: ['25%', '25%', '25%', '25%'],
        },
      },
    },
    overgedragen: {
      title: 'Overgedragen erfpachtfacturen',
    },
    afgehandeld: {
      title: 'Afgehandelde erfpachtfacturen',
    },
  },
});

type DisplayPropsDossiers = DisplayProps<ErfpachtDossierFrontend>;
type DisplayPropsWijzigingsaanvragen = DisplayProps<
  ErfpachtZaakExcerptFrontend & { dossierLinks: ReactNode[] }
>;

export function getTableConfig(erfpachtData: ErfpachtResponseFrontend | null) {
  const dossiersBase = erfpachtData?.dossiers;
  const [firstZaak] = erfpachtData?.zaken ?? [];

  // Wijzigingsaanvragen table on themapagina
  const displayPropsWijzigingsaanvragen: DisplayPropsWijzigingsaanvragen = {
    props: {
      zaakNummer: firstZaak?.titelZaakNummer,
      dossierLinks: 'Erfpachtdossier',
      displayStatus: 'Status',
      formattedStatusDatum: firstZaak?.titelFormattedStatusDatum,
    },
    colWidths: {
      large: ['25%', '25%', '25%', '25%'],
      small: ['100%', '0', '0', '0'],
    },
  };

  // Erfpachtrechten table on themapagina
  const displayPropsDossiers: DisplayPropsDossiers = {
    props: {
      dossierNummer: dossiersBase?.titelDossiernummer,
      voorkeursadres: dossiersBase?.titelVoorkeursAdres,
    },
    colWidths: {
      large: ['50%', '50%'],
      small: ['30%', '70%'],
    },
  };

  const titleDossiers = erfpachtData?.titelDossiersKop;

  // Table on dossier detail pagina
  const displayPropsDossierDetailZaken: DisplayProps<ErfpachtZaakExcerptFrontend> =
    {
      props: {
        zaakNummer: firstZaak?.titelZaakNummer,
        displayStatus: 'Status',
        formattedStatusDatum: firstZaak?.titelFormattedStatusDatum,
      },
      colWidths: {
        large: ['33%', '33%', '34%'],
        small: ['50%', '50%', '0'],
      },
    };

  const tableConfig = {
    [listPageParamKind.erfpachtZaken]: {
      title: 'Wijzigingsaanvragen',
      displayProps: displayPropsWijzigingsaanvragen,
      listPageRoute: generatePath(themaConfig.listPageZaken.route.path, {
        page: null,
      }),
      maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_DOSSIERS,
    },
    [listPageParamKind.erfpachtDossierDetailZaken]: {
      title: 'Wijzigingsaanvragen',
      displayProps: displayPropsDossierDetailZaken,
      listPageRoute: generatePath(themaConfig.listPageZaken.route.path, {
        page: null,
      }),
      maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_DOSSIERS,
    },
    [listPageParamKind.erfpachtDossiers]: {
      title: titleDossiers ?? 'Erfpachtrechten',
      listPageRoute: generatePath(themaConfig.listPageDossiers.route.path, {
        page: null,
      }),
      displayProps: displayPropsDossiers,
      maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_DOSSIERS,
    },
  } as const;

  return tableConfig;
}
