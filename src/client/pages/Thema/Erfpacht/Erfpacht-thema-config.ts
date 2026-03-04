import { generatePath } from 'react-router';

import {
  ErfpachtDossierFrontend,
  ErfpachtDossiersResponse,
} from '../../../../server/services/erfpacht/erfpacht-types';
import { IS_PRODUCTION } from '../../../../universal/config/env';
import { DisplayProps } from '../../../components/Table/TableV2.types';
import { propagateFeatureToggles } from '../../../config/feature-toggles';
import type {
  PageConfig,
  ThemaConfigBase,
  WithDetailPage,
  WithListPage,
} from '../../../config/thema-types';
import {
  getAfisListPageDocumentTitle,
  getFacturenTableConfig,
} from '../Afis/Afis-thema-config';

// Themapagina
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_DOSSIERS = 5;

const THEMA_ID = 'ERFPACHT';
const THEMA_TITLE = 'Erfpacht';

export const LINKS = {
  algemeneBepalingen:
    'https://www.amsterdam.nl/wonen-leefomgeving/erfpacht/wat-is-erfpacht/algemene-bepalingen/',
  overstappenEewigdurendeErfpacht:
    'https://www.amsterdam.nl/wonen-leefomgeving/erfpacht/overstappen-eeuwigdurende-erfpacht/',
  erfpachtWijzigenForm: `https://formulieren${IS_PRODUCTION ? '' : '.acc'}.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/ErfpachtWijzigen.aspx`,
};

type WithDetailPageFactuur = PageConfig<'detailPageFactuur'>;
type WithListPageFacturen = PageConfig<'listPageFacturen'>;

type ThemaConfigErfpacht = ThemaConfigBase &
  WithDetailPage &
  WithListPage &
  WithDetailPageFactuur &
  WithListPageFacturen &
  WithDetailPageFactuur &
  WithListPageFacturen;

export const themaConfig: ThemaConfigErfpacht = {
  id: THEMA_ID,
  title: THEMA_TITLE,
  redactedScope: 'none',
  profileTypes: ['private'], //COMMERCIAL IS IN ERFPACHT-RENDER-CONFIG, BECAUSE HAS ANOTHER MENUITEM
  featureToggle: propagateFeatureToggles({
    active: true,
    canonmatigingLinkActive: true,
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
  detailPage: {
    route: {
      path: '/erfpacht/dossier/:dossierNummerUrlParam',
      trackingUrl: '/erfpacht/dossier',
      documentTitle: `Erfpachtdossier | ${THEMA_TITLE}`,
    },
  },
  listPage: {
    route: {
      path: '/erfpacht/dossiers/:page?',
      documentTitle: `Lijst met dossiers | ${THEMA_TITLE}`,
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
};

export const listPageParamKind = {
  erfpachtDossiers: 'erfpacht-dossiers',
} as const;

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const themaId = 'ERFPACHT' as const;
export const themaTitle = 'Erfpacht';

export const ERFPACHT_ZAKELIJK_ROUTE_DEFAULT =
  'https://erfpachtzakelijk.amsterdam.nl';

export const erfpachtFacturenTableConfig = getFacturenTableConfig({
  listPagePath: themaConfig.listPageFacturen.route.path,
  mergeConfig: {
    open: {
      title: 'Openstaande erfpachtfacturen',
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

export function getTableConfig(erfpachtData: ErfpachtDossiersResponse | null) {
  const dossiersBase = erfpachtData?.dossiers;

  const displayPropsDossiers: DisplayPropsDossiers = {
    voorkeursadres: dossiersBase?.titelVoorkeursAdres,
    dossierNummer: dossiersBase?.titelDossiernummer,
  };

  const titleDossiers = erfpachtData?.titelDossiersKop;

  const tableConfig = {
    [listPageParamKind.erfpachtDossiers]: {
      title: titleDossiers ?? 'Erfpachtrechten',
      listPageRoute: generatePath(themaConfig.listPage.route.path, {
        page: null,
      }),
      displayProps: displayPropsDossiers,
      maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_DOSSIERS,
    },
  } as const;

  return tableConfig;
}
