import { generatePath } from 'react-router';

import {
  ErfpachtDossierFrontend,
  ErfpachtDossiersResponse,
} from '../../../../server/services/erfpacht/erfpacht-types';
import { IS_PRODUCTION } from '../../../../universal/config/env';
import { LinkProps } from '../../../../universal/types/App.types';
import { DisplayProps } from '../../../components/Table/TableV2.types';
import type { ThemaRoutesConfig } from '../../../config/thema-types';
import {
  getAfisListPageDocumentTitle,
  getFacturenTableConfig,
} from '../Afis/Afis-thema-config';

// Themapagina
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_DOSSIERS = 5;

export const LINKS = {
  algemeneBepalingen:
    'https://www.amsterdam.nl/wonen-leefomgeving/erfpacht/wat-is-erfpacht/algemene-bepalingen/',
  overstappenEewigdurendeErfpacht:
    'https://www.amsterdam.nl/wonen-leefomgeving/erfpacht/overstappen-eeuwigdurende-erfpacht/',
  erfpachtWijzigenForm: `https://formulieren${IS_PRODUCTION ? '' : '.acc'}.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/ErfpachtWijzigen.aspx`,
};

export const linkListItems: LinkProps[] = [
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
];

export const listPageParamKind = {
  erfpachtDossiers: 'erfpacht-dossiers',
} as const;

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const featureToggle = {
  erfpachtActive: true,
  canonmatigingLinkActive: true,
};

export const themaId = 'ERFPACHT' as const;
export const themaTitle = 'Erfpacht';

export const ERFPACHT_ZAKELIJK_ROUTE_DEFAULT =
  'https://erfpachtzakelijk.amsterdam.nl';

export const routeConfig = {
  detailPage: {
    path: '/erfpacht/dossier/:dossierNummerUrlParam',
    trackingUrl: '/erfpacht/dossier',
    documentTitle: `Erfpachtdossier | ${themaTitle}`,
  },
  listPage: {
    path: '/erfpacht/dossiers/:page?',
    documentTitle: `Lijst met dossiers | ${themaTitle}`,
    trackingUrl: null,
  },
  themaPage: {
    path: '/erfpacht',
    documentTitle: `${themaTitle} | overzicht`,
    trackingUrl: null,
  },
  detailPageFactuur: {
    path: '/erfpacht/factuur/:state/:factuurNummer',
    documentTitle: `Factuurgegevens | ${themaTitle}`,
    trackingUrl: null,
  },
  listPageFacturen: {
    path: '/erfpacht/facturen/lijst/:state/:page?',
    documentTitle: getAfisListPageDocumentTitle,
    trackingUrl: null,
  },
} as const satisfies ThemaRoutesConfig;

export const erfpachtFacturenTableConfig = getFacturenTableConfig({
  listPagePath: routeConfig.listPageFacturen.path,
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
      listPageRoute: generatePath(routeConfig.listPage.path, {
        page: null,
      }),
      displayProps: displayPropsDossiers,
      maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_DOSSIERS,
    },
  } as const;

  return tableConfig;
}
