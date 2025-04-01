import {
  ErfpachtDossierFactuur,
  ErfpachtDossier,
  ErfpachtDossiersDetail,
  ErfpachtDossiersResponse,
} from '../../../server/services/erfpacht/erfpacht';
import { IS_PRODUCTION } from '../../../universal/config/env';
import { AppRoutes } from '../../../universal/config/routes';
import { LinkProps } from '../../../universal/types/App.types';
import { withOmitDisplayPropsForSmallScreens } from '../../components/Table/helpers';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../components/Table/TableV2';

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

export const routes = {
  listPageOpenFacturen: AppRoutes['ERFPACHT/OPEN_FACTUREN'],
  listPageAlleFacturen: AppRoutes['ERFPACHT/ALLE_FACTUREN'],
  listPageDossiers: AppRoutes['ERFPACHT/DOSSIERS'],
  detailPageDossier: AppRoutes['ERFPACHT/DOSSIERDETAIL'],
  themaPage: AppRoutes.ERFPACHT,
} as const;

export const listPageParamKind = {
  erfpachtRechten: 'erfpachtrechten',
  openFacturen: 'openstaande-facturen',
  alleFacturen: 'alle-facturen',
} as const;

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

type DisplayPropsDossiers = DisplayProps<
  WithDetailLinkComponent<ErfpachtDossier>
>;
export type DisplayPropsFacturen = DisplayProps<
  WithDetailLinkComponent<ErfpachtDossierFactuur>
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
      listPageRoute: routes.listPageDossiers,
      displayProps: displayPropsDossiers,
      maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_DOSSIERS,
    },
    [listPageParamKind.openFacturen]: {
      title: titleOpenFacturen ?? 'Openstaande facturen',
      listPageRoute: routes.listPageOpenFacturen,
      displayProps: withOmitDisplayPropsForSmallScreens(
        displayPropsOpenFacturen,
        ['dossierAdres', 'status', 'formattedFactuurBedrag']
      ),
      maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_FACTUREN,
    },
    [listPageParamKind.alleFacturen]: {
      title: dossier?.facturen.titelFacturen?.toLocaleLowerCase() ?? 'Facturen',
      listPageRoute: routes.listPageAlleFacturen,
      displayProps: withOmitDisplayPropsForSmallScreens(
        displayPropsAlleFacturen,
        ['formattedFactuurBedrag', 'vervalDatum']
      ),
      maxItems: MAX_TABLE_ROWS_ON_DETAIL_PAGINA_FACTUREN,
    },
  } as const;

  return tableConfig;
}
