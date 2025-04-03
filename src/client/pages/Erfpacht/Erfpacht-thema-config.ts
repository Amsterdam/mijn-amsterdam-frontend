import {
  ErfpachtDossierFactuur,
  ErfpachtV2Dossier,
  ErfpachtV2DossiersDetail,
  ErfpachtV2DossiersResponse,
} from '../../../server/services/simple-connect/erfpacht';
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

export const linkListItems: LinkProps[] = [
  {
    to: 'https://www.amsterdam.nl/wonen-leefomgeving/erfpacht/',
    title: 'Meer informatie over erfpacht in Amsterdam',
  },
  {
    to: `https://formulieren${IS_PRODUCTION ? '' : '.acc'}.amsterdam.nl/TriplEforms/DirectRegelen/formulier/nl-NL/evAmsterdam/ErfpachtWijzigen.aspx`,
    title: 'Erfpacht wijzigen',
  },
  {
    to: 'https://www.amsterdam.nl/wonen-leefomgeving/erfpacht/overstappen-eeuwigdurende-erfpacht/',
    title: 'Overstappen erfpachtrecht',
  },
];

export const routes = {
  listPageOpenFacturen: AppRoutes['ERFPACHTv2/OPEN_FACTUREN'],
  listPageAlleFacturen: AppRoutes['ERFPACHTv2/ALLE_FACTUREN'],
  listPageDossiers: AppRoutes['ERFPACHTv2/DOSSIERS'],
  detailPageDossier: AppRoutes['ERFPACHTv2/DOSSIERDETAIL'],
  themaPage: AppRoutes.ERFPACHTv2,
} as const;

export const listPageParamKind = {
  erfpachtRechten: 'erfpachtrechten',
  openFacturen: 'openstaande-facturen',
  alleFacturen: 'alle-facturen',
} as const;

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

type DisplayPropsDossiers = DisplayProps<
  WithDetailLinkComponent<ErfpachtV2Dossier>
>;
export type DisplayPropsFacturen = DisplayProps<
  WithDetailLinkComponent<ErfpachtDossierFactuur>
>;

export function getTableConfig({
  erfpachtData,
  dossier,
}: {
  erfpachtData: ErfpachtV2DossiersResponse | null;
  dossier?: ErfpachtV2DossiersDetail;
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
