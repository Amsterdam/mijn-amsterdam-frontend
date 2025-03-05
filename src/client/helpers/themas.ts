import { FeatureToggle } from '../../universal/config/feature-toggles';
import { Themas } from '../../universal/config/thema';
import { isLoading } from '../../universal/helpers/api';
import { isMokum } from '../../universal/helpers/brp';
import { AppState, AppStateKey } from '../../universal/types/App.types';
import { DecosCaseType } from '../../universal/types/vergunningen';
import { ThemaMenuItem } from '../config/thema';
import { PARKEER_CASE_TYPES } from '../pages/Parkeren/Parkeren-thema-config';

export function isThemaActive(item: ThemaMenuItem, appState: AppState) {
  const {
    AFIS,
    AFVAL,
    AVG,
    BELASTINGEN,
    BEZWAREN,
    BODEM,
    BRP,
    ERFPACHT,
    ERFPACHTv2,
    HLI,
    HORECA,
    KLACHTEN,
    KREFIA,
    KVK,
    MILIEUZONE,
    MY_LOCATION,
    OVERTREDINGEN,
    PARKEREN,
    SUBSIDIE,
    SVWI,
    TOERISTISCHE_VERHUUR,
    VAREN,
    VERGUNNINGEN,
    VERGUNNINGENv2,
    WMO,
    WPI_AANVRAGEN,
    WPI_BBZ,
    WPI_SPECIFICATIES,
    WPI_TONK,
    WPI_TOZO,
  }: AppState = appState;

  const isAmsterdam = isMokum(BRP?.content) || isMokum(KVK?.content);

  switch (item.id) {
    case Themas.AFIS: {
      return FeatureToggle.afisActive && AFIS?.content?.isKnown;
    }
    case Themas.INKOMEN: {
      const { jaaropgaven, uitkeringsspecificaties } =
        WPI_SPECIFICATIES?.content ?? {};
      const hasAanvragen = WPI_AANVRAGEN?.content?.length;
      const hasTozo = !!WPI_TOZO?.content?.length;
      const hasTonk = !!WPI_TONK?.content?.length;
      const hasBbz = !!WPI_BBZ?.content?.length;
      const hasJaaropgaven = !!jaaropgaven?.length;
      const hasUitkeringsspecificaties = !!uitkeringsspecificaties?.length;

      return (
        !(
          isLoading(WPI_AANVRAGEN) &&
          isLoading(WPI_SPECIFICATIES) &&
          isLoading(WPI_TOZO) &&
          isLoading(WPI_TONK) &&
          isLoading(WPI_BBZ)
        ) &&
        (hasAanvragen ||
          hasTozo ||
          hasTonk ||
          hasJaaropgaven ||
          hasBbz ||
          hasUitkeringsspecificaties)
      );
    }

    case Themas.SVWI:
      return (
        isAmsterdam &&
        FeatureToggle.svwiLinkActive &&
        SVWI?.content?.isKnown === true
      );

    case Themas.HLI: {
      const hasStadspas =
        !!HLI?.content?.stadspas?.length &&
        FeatureToggle.hliThemaStadspasActive;
      const hasRegelingen =
        !!HLI?.content?.regelingen?.length &&
        FeatureToggle.hliThemaRegelingenActive;
      const isLoadingHLI = isLoading(HLI);
      return (
        FeatureToggle.hliThemaActive &&
        !isLoadingHLI &&
        (hasStadspas || hasRegelingen)
      );
    }

    case Themas.ZORG:
      return (
        FeatureToggle.zorgv2ThemapaginaActive &&
        !isLoading(WMO) &&
        !!WMO.content?.length
      );

    case Themas.BELASTINGEN: {
      // Belastingen always visible if we receive an error from the api
      const belastingenActive =
        FeatureToggle.belastingApiActive && BELASTINGEN?.status === 'OK'
          ? BELASTINGEN.content?.isKnown
          : true;
      return !isLoading(BELASTINGEN) && belastingenActive;
    }

    case Themas.MILIEUZONE:
      return (
        !isLoading(MILIEUZONE) &&
        (FeatureToggle.cleopatraApiActive ? MILIEUZONE.content?.isKnown : false)
      );

    case Themas.OVERTREDINGEN:
      return (
        !isLoading(OVERTREDINGEN) &&
        (FeatureToggle.cleopatraApiActive && FeatureToggle.overtredingenActive
          ? OVERTREDINGEN.content?.isKnown
          : false)
      );

    case Themas.AFVAL:
      return (
        FeatureToggle.garbageInformationPage &&
        !isLoading(AFVAL) &&
        !isLoading(MY_LOCATION) &&
        isAmsterdam
      );

    case Themas.ERFPACHT:
      return !isLoading(ERFPACHT) && ERFPACHT.content?.isKnown === true;

    case Themas.ERFPACHTv2:
      return (
        FeatureToggle.erfpachtV2Active &&
        !isLoading(ERFPACHTv2) &&
        ERFPACHTv2.content !== null &&
        (('dossiers' in ERFPACHTv2.content &&
          !!ERFPACHTv2.content.dossiers.dossiers?.length) ||
          !!ERFPACHTv2.content?.isKnown)
      );

    case Themas.SUBSIDIE:
      return !isLoading(SUBSIDIE) && SUBSIDIE.content?.isKnown === true;

    case Themas.BURGERZAKEN: {
      const hasIdentiteitsbewijs = !!BRP?.content?.identiteitsbewijzen?.length;
      return (
        FeatureToggle.identiteitsbewijzenActive &&
        !isLoading(BRP) &&
        hasIdentiteitsbewijs
      );
    }

    case Themas.BRP: {
      return !isLoading(BRP) && !!BRP.content?.persoon;
    }

    case Themas.VERGUNNINGEN:
      return (
        (!isLoading(VERGUNNINGEN) && !!VERGUNNINGEN.content?.length) ||
        (!isLoading(VERGUNNINGENv2) && !!VERGUNNINGENv2.content?.length)
      );

    case Themas.KVK:
      return !isLoading(KVK) && !!KVK.content;

    case Themas.TOERISTISCHE_VERHUUR: {
      const { lvvRegistraties, vakantieverhuurVergunningen, bbVergunningen } =
        TOERISTISCHE_VERHUUR?.content ?? {};
      const hasRegistraties = !!lvvRegistraties?.length;
      const hasVergunningen =
        !!vakantieverhuurVergunningen?.length || !!bbVergunningen?.length;
      return (
        !isLoading(TOERISTISCHE_VERHUUR) && (hasRegistraties || hasVergunningen)
      );
    }

    case Themas.KREFIA:
      return !isLoading(KREFIA) && !!KREFIA.content?.deepLinks;

    case Themas.PARKEREN: {
      const hasParkeerVergunningenFromThemaVergunningen = (
        appState.VERGUNNINGEN?.content ?? []
      ).some((vergunning) =>
        PARKEER_CASE_TYPES.has(vergunning.caseType as DecosCaseType)
      );

      return (
        FeatureToggle.parkerenActive &&
        !isLoading(PARKEREN) &&
        !isLoading(VERGUNNINGEN) &&
        (!!PARKEREN?.content?.isKnown ||
          hasParkeerVergunningenFromThemaVergunningen)
      );
    }

    case Themas.KLACHTEN:
      return (
        !isLoading(KLACHTEN) &&
        !!KLACHTEN?.content?.klachten.length &&
        FeatureToggle.klachtenActive
      );

    case Themas.BEZWAREN:
      return (
        !isLoading(BEZWAREN) &&
        !!BEZWAREN?.content?.length &&
        FeatureToggle.bezwarenActive
      );

    case Themas.VAREN:
      return (
        !isLoading(VAREN) &&
        !!VAREN?.content?.length &&
        FeatureToggle.varenActive
      );

    case Themas.HORECA:
      return (
        !isLoading(HORECA) &&
        !!HORECA?.content?.length &&
        FeatureToggle.horecaActive
      );

    case Themas.AVG:
      return (
        !isLoading(AVG) &&
        !!AVG?.content?.verzoeken?.length &&
        FeatureToggle.avgActive
      );

    case Themas.BODEM:
      return (
        !isLoading(BODEM) &&
        !!BODEM?.content?.metingen?.length &&
        FeatureToggle.bodemActive
      );
  }

  return false;
}

export function getThemaMenuItemsAppState(
  appState: AppState,
  themaItems: ThemaMenuItem[]
) {
  return themaItems
    .filter(
      ({ isAlwaysVisible, hasAppStateValue }) =>
        isAlwaysVisible !== true && hasAppStateValue !== false
    )
    .map(({ id }) => appState[id as AppStateKey])
    .filter((apiState) => !!apiState);
}
