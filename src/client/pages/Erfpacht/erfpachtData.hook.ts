import { ErfpachtV2DossiersResponse } from '../../../server/services/simple-connect/erfpacht';
import { isLoading } from '../../../universal/helpers';
import { addLinkElementToProperty } from '../../components/Table/Table';
import { useMediumScreen } from '../../hooks/media.hook';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './Erfpacht.module.scss';

type DisplayPropsDossiers = Record<string, string> & {
  voorkeursadres: string;
  dossierNummer: string;
  zaaknummer?: string;
  wijzigingsAanvragen?: string;
};

type DisplayPropsFacturen = Record<string, string> & {
  dossierAdres?: string;
  factuurNummer: string;
  formattedFactuurBedrag: string;
  status?: string;
  vervalDatum: string;
};

export function useErfpachtV2Data() {
  const { ERFPACHTv2 } = useAppStateGetter();
  const isMediumScreen = useMediumScreen();
  const erfpachtData = ERFPACHTv2.content as ErfpachtV2DossiersResponse;
  const dossiersBase = erfpachtData?.dossiers;
  const dossiers = addLinkElementToProperty(
    dossiersBase?.dossiers ?? [],
    'voorkeursadres'
  );
  const openFacturenBase = erfpachtData?.openstaandeFacturen;
  const openFacturen = openFacturenBase?.facturen ?? [];

  let displayPropsDossiers: DisplayPropsDossiers | null = null;
  let titleDossiers = erfpachtData?.titelDossiersKop;
  let displayPropsOpenFacturen: Partial<DisplayPropsFacturen> | null = null;
  let displayPropsAlleFacturen: DisplayPropsFacturen | null = null;
  let titleOpenFacturen = erfpachtData?.titelOpenFacturenKop;

  if (!!dossiersBase) {
    displayPropsDossiers = {
      voorkeursadres: dossiersBase.titelVoorkeursAdres,
      dossierNummer: dossiersBase.titelDossiernummer,
    };

    if (!!dossiers?.length && 'zaaknummer' in dossiers[0]) {
      displayPropsDossiers.zaaknummer = dossiersBase.titelZaakNummer;
    }
    if (!!dossiers?.length && 'wijzigingsAanvragen' in dossiers[0]) {
      displayPropsDossiers.wijzigingsAanvragen =
        dossiersBase.titelWijzigingsAanvragen;
    }
  }

  if (!!openFacturenBase) {
    if (isMediumScreen) {
      displayPropsOpenFacturen = {
        dossierAdres: openFacturenBase.titelFacturenDossierAdres,
      };
    }
    displayPropsOpenFacturen = {
      ...displayPropsOpenFacturen,
      factuurNummer: openFacturenBase.titelFacturenNummer,
      formattedFactuurBedrag: openFacturenBase.titelFacturenFactuurBedrag,
      status: openFacturenBase.titelFacturenStatus,
      vervalDatum: openFacturenBase.titelFacturenVervaldatum,
    };
  }

  if (!!openFacturenBase) {
    displayPropsAlleFacturen = {
      factuurNummer: openFacturenBase.titelFacturenNummer,
      formattedFactuurBedrag: openFacturenBase.titelFacturenFactuurBedrag,
      status: openFacturenBase.titelFacturenStatus,
      vervalDatum: openFacturenBase.titelFacturenVervaldatum,
    };
  }

  return {
    isMediumScreen,
    ERFPACHTv2,
    openFacturen,
    dossiers,
    displayPropsDossiers,
    displayPropsOpenFacturen,
    displayPropsAlleFacturen,
    titleDossiers,
    titleOpenFacturen,
    isLoading: isLoading(ERFPACHTv2),
  };
}
