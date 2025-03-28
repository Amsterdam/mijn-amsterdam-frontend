import {
  ErfpachtDossierFactuur,
  ErfpachtV2Dossier,
  ErfpachtV2DossiersResponse,
} from '../../../server/services/simple-connect/erfpacht';
import { IS_PRODUCTION } from '../../../universal/config/env';
import { AppRoutes } from '../../../universal/config/routes';
import { LinkProps } from '../../../universal/types/App.types';
import {
  DisplayProps,
  WithDetailLinkComponent,
} from '../../components/Table/TableV2';

// Themapagina
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_DOSSIERS = 5;
const MAX_TABLE_ROWS_ON_THEMA_PAGINA_FACTUREN =
  MAX_TABLE_ROWS_ON_THEMA_PAGINA_DOSSIERS;

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

const listPageParamKind = {
  erfpachtRechten: 'erfpachtrechten',
  openFacturen: 'openstaande-facturen',
} as const;

export type ListPageParamKey = keyof typeof listPageParamKind;
export type ListPageParamKind = (typeof listPageParamKind)[ListPageParamKey];

type DisplayPropsDossiers = DisplayProps<
  WithDetailLinkComponent<ErfpachtV2Dossier>
>;
type DisplayPropsFacturen = DisplayProps<
  WithDetailLinkComponent<ErfpachtDossierFactuur>
>;

export function getTableConfig({
  erfpachtData,
}: {
  erfpachtData: ErfpachtV2DossiersResponse | null;
}) {
  if (!erfpachtData) {
    return null;
  }

  const dossiersBase = erfpachtData.dossiers;
  const openFacturenBase = erfpachtData.openstaandeFacturen;

  const displayPropsDossiers: DisplayPropsDossiers = {
    voorkeursadres: dossiersBase.titelVoorkeursAdres,
    dossierNummer: dossiersBase.titelDossiernummer,
  };

  const titleDossiers = erfpachtData?.titelDossiersKop;
  const titleOpenFacturen = erfpachtData?.titelOpenFacturenKop;

  const displayPropsOpenFacturen: DisplayPropsFacturen = {
    dossierAdres: openFacturenBase.titelFacturenDossierAdres,
    factuurNummer: openFacturenBase.titelFacturenNummer,
    formattedFactuurBedrag: openFacturenBase.titelFacturenFactuurBedrag,
    status: openFacturenBase.titelFacturenStatus,
    vervalDatum: openFacturenBase.titelFacturenVervaldatum,
  };

  const displayPropsAlleFacturen: DisplayPropsFacturen = {
    factuurNummer: openFacturenBase.titelFacturenNummer,
    formattedFactuurBedrag: openFacturenBase.titelFacturenFactuurBedrag,
    status: openFacturenBase.titelFacturenStatus,
    vervalDatum: openFacturenBase.titelFacturenVervaldatum,
  };

  const tableConfig = {
    [listPageParamKind.erfpachtRechten]: {
      title: titleDossiers ?? 'Erfpachtrechten',
      listPageRoute: AppRoutes['ERFPACHTv2/DOSSIERS'],
      displayProps: displayPropsDossiers,
      maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_DOSSIERS,
    },
    [listPageParamKind.openFacturen]: {
      title: titleOpenFacturen ?? 'Openstaande facturen',
      listPageRoute: AppRoutes['ERFPACHTv2/ALLE_FACTUREN'],
      displayProps: displayPropsOpenFacturen,
      maxItems: MAX_TABLE_ROWS_ON_THEMA_PAGINA_FACTUREN,
    },
  } as const;

  return tableConfig;
}
