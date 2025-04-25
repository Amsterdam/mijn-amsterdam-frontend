import {
  ErfpachtDossierFrontend,
  ErfpachtDossierFactuurFrontend,
  ErfpachtDossiersResponse,
  ErfpachtDossiersDetail,
} from '../../../../server/services/erfpacht/erfpacht-types';
import { IS_PRODUCTION } from '../../../../universal/config/env';
import { LinkProps } from '../../../../universal/types/App.types';
import { withOmitDisplayPropsForSmallScreens } from '../../../components/Table/helpers';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../../components/Table/TableV2.types';
import type { ThemaRoutesConfig } from '../../../config/thema-types';

// Themapagina
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_DOSSIERS = 5;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_FACTUREN =
  MAX_TABLE_ROWS_ON_THEMA_PAGINA_DOSSIERS;
const MAX_TABLE_ROWS_ON_DETAIL_PAGINA_FACTUREN =
  MAX_TABLE_ROWS_ON_THEMA_PAGINA_FACTUREN;

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
  erfpachtRechten: 'erfpachtrechten',
  openFacturen: 'openstaande-facturen',
  alleFacturen: 'alle-facturen',
} as const;

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

export const featureToggle = {
  erfpachtActive: true,
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
  listPageOpenFacturen: {
    path: '/erfpacht/lijst/open-facturen/:page?',
    documentTitle: `Lijst met open facturen | ${themaTitle}`,
  },
  listPageAlleFacturen: {
    path: '/erfpacht/lijst/facturen/:dossierNummerUrlParam/:page?',
    trackingUrl: '/erfpacht/lijst/facturen-dossier',
    documentTitle: `Lijst met facturen | ${themaTitle}`,
  },
  listPageDossiers: {
    path: '/erfpacht/dossiers/:page?',
    documentTitle: `Lijst met facturen | ${themaTitle}`,
  },
  themaPage: {
    path: '/erfpacht',
    documentTitle: `${themaTitle} | overzicht`,
  },
} as const satisfies ThemaRoutesConfig;

type DisplayPropsDossiers = DisplayProps<
  WithDetailLinkComponent<ErfpachtDossierFrontend>
>;
export type DisplayPropsFacturen = DisplayProps<
  WithDetailLinkComponent<ErfpachtDossierFactuurFrontend>
>;

export function getTableConfig({
  erfpachtData,
  dossier,
}: {
  erfpachtData: ErfpachtDossiersResponse | null;
  dossier?: ErfpachtDossiersDetail;
}) {
  const dossiersBase = erfpachtData?.dossiers;
  const openFacturenBase = erfpachtData?.openstaandeFacturen;

  const displayPropsDossiers: DisplayPropsDossiers = {
    voorkeursadres: dossiersBase?.titelVoorkeursAdres,
    dossierNummer: dossiersBase?.titelDossiernummer,
  };

  const titleDossiers = erfpachtData?.titelDossiersKop;
  const titleOpenFacturen = erfpachtData?.titelOpenFacturenKop;

  const displayPropsOpenFacturen: DisplayPropsFacturen = {
    dossierAdres: openFacturenBase?.titelFacturenDossierAdres,
    factuurNummer: openFacturenBase?.titelFacturenNummer,
    formattedFactuurBedrag: openFacturenBase?.titelFacturenFactuurBedrag,
    status: openFacturenBase?.titelFacturenStatus,
    vervalDatum: openFacturenBase?.titelFacturenVervaldatum,
  };

  const displayPropsAlleFacturen: DisplayPropsFacturen = {
    factuurNummer: openFacturenBase?.titelFacturenNummer,
    formattedFactuurBedrag: openFacturenBase?.titelFacturenFactuurBedrag,
    status: openFacturenBase?.titelFacturenStatus,
    vervalDatum: openFacturenBase?.titelFacturenVervaldatum,
  };

  const tableConfig = {
    [listPageParamKind.erfpachtRechten]: {
      title: titleDossiers ?? 'Erfpachtrechten',
      listPageRoute: routeConfig.listPageDossiers.path,
      displayProps: displayPropsDossiers,
      maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_DOSSIERS,
    },
    [listPageParamKind.openFacturen]: {
      title: titleOpenFacturen ?? 'Openstaande facturen',
      listPageRoute: routeConfig.listPageOpenFacturen.path,
      displayProps: withOmitDisplayPropsForSmallScreens(
        displayPropsOpenFacturen,
        ['dossierAdres', 'status', 'formattedFactuurBedrag']
      ),
      maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_FACTUREN,
    },
    [listPageParamKind.alleFacturen]: {
      title: dossier?.facturen.titelFacturen?.toLocaleLowerCase() ?? 'Facturen',
      listPageRoute: routeConfig.listPageAlleFacturen.path,
      displayProps: withOmitDisplayPropsForSmallScreens(
        displayPropsAlleFacturen,
        ['formattedFactuurBedrag', 'vervalDatum']
      ),
      maxItems: MAX_TABLE_ROWS_ON_DETAIL_PAGINA_FACTUREN,
    },
  } as const;

  return tableConfig;
}
