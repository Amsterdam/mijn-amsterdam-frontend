import { ThemaMenuItem, Themas, FeatureToggle } from '../config';
import { isLoading, isMokum } from '.';
import type { AppState, AppStateKey } from '../../client/AppState';

export function isThemaActive(item: ThemaMenuItem, appState: AppState) {
  const {
    WMO,
    WPI_SPECIFICATIES,
    WPI_AANVRAGEN,
    STADSPAS,
    WPI_TOZO,
    WPI_TONK,
    WPI_BBZ,
    SVWI,
    ERFPACHT,
    ERFPACHTv2,
    AFVAL,
    BRP,
    BELASTINGEN,
    MILIEUZONE,
    OVERTREDINGEN,
    VERGUNNINGEN,
    SIA,
    TOERISTISCHE_VERHUUR,
    SUBSIDIE,
    MY_LOCATION,
    KVK,
    KREFIA,
    KLACHTEN,
    BEZWAREN,
    HORECA,
    AVG,
    BODEM,
  }: AppState = appState;

  const isAmsterdam = isMokum(BRP?.content) || isMokum(KVK?.content);

  switch (item.id) {
    case Themas.INKOMEN:
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

    case Themas.SVWI:
      return (
        isAmsterdam &&
        FeatureToggle.svwiLinkActive &&
        SVWI?.content?.isKnown === true
      );

    case Themas.STADSPAS:
      const hasStadspas =
        !!STADSPAS?.content?.stadspassen?.length ||
        !!STADSPAS?.content?.aanvragen?.length;
      const isLoadingStadspas = isLoading(STADSPAS);
      return !isLoadingStadspas && hasStadspas;

    case Themas.ZORG:
      return !isLoading(WMO) && !!WMO.content?.length;

    case Themas.BELASTINGEN:
      // Belastingen always visible if we receive an error from the api
      const belastingenActive =
        FeatureToggle.belastingApiActive && BELASTINGEN?.status === 'OK'
          ? BELASTINGEN.content?.isKnown
          : true;
      return !isLoading(BELASTINGEN) && belastingenActive;

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

    case Themas.SIA:
      const hasSiaItems =
        !!SIA?.content?.open?.items.length ||
        !!SIA?.content?.afgesloten?.items.length;
      return (FeatureToggle.siaActive ? hasSiaItems : false) && !isLoading(SIA);

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

    case Themas.BURGERZAKEN:
      const hasIdentiteitsbewijs = !!BRP?.content?.identiteitsbewijzen?.length;
      return (
        FeatureToggle.identiteitsbewijzenActive &&
        !isLoading(BRP) &&
        hasIdentiteitsbewijs
      );

    case Themas.BRP:
      return !isLoading(BRP) && !!BRP.content?.persoon;

    case Themas.VERGUNNINGEN:
      return !isLoading(VERGUNNINGEN) && !!VERGUNNINGEN.content?.length;

    case Themas.KVK:
      return !isLoading(KVK) && !!KVK.content;

    case Themas.TOERISTISCHE_VERHUUR:
      const { lvvRegistraties, vakantieverhuurVergunningen, bbVergunningen } =
        TOERISTISCHE_VERHUUR?.content ?? {};
      const hasRegistraties = !!lvvRegistraties?.length;
      const hasVergunningen =
        !!vakantieverhuurVergunningen?.length || !!bbVergunningen?.length;
      return (
        !isLoading(TOERISTISCHE_VERHUUR) && (hasRegistraties || hasVergunningen)
      );

    case Themas.KREFIA:
      return !isLoading(KREFIA) && !!KREFIA.content?.deepLinks;

    case Themas.PARKEREN:
      return isAmsterdam && FeatureToggle.parkerenActive;

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
