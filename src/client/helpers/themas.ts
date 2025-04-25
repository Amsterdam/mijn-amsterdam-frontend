import { FeatureToggle } from '../../universal/config/feature-toggles';
import { ThemaIDs } from '../../universal/config/thema';
import { isLoading } from '../../universal/helpers/api';
import { isMokum } from '../../universal/helpers/brp';
import { AppState, AppStateKey } from '../../universal/types/App.types';
import { ThemaMenuItem } from '../config/thema-types';

export function isThemaActive(item: ThemaMenuItem, appState: AppState) {
  const {
    BELASTINGEN,
    BRP,
    ERFPACHT,
    HLI,
    HORECA,
    KLACHTEN,
    KREFIA,
    KVK,
    MILIEUZONE,
    OVERTREDINGEN,
    PARKEREN,
    SUBSIDIE,
    SVWI,
    TOERISTISCHE_VERHUUR,
    VAREN,
    VERGUNNINGEN,
    WMO,
  }: AppState = appState;

  const isAmsterdam = isMokum(BRP?.content) || isMokum(KVK?.content);

  switch (item.id) {
    case ThemaIDs.SVWI:
      return (
        isAmsterdam &&
        FeatureToggle.svwiLinkActive &&
        SVWI?.content?.isKnown === true
      );

    case ThemaIDs.HLI: {
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

    case ThemaIDs.ZORG:
      return (
        FeatureToggle.zorgv2ThemapaginaActive &&
        !isLoading(WMO) &&
        !!WMO.content?.length
      );

    case ThemaIDs.BELASTINGEN: {
      // Belastingen always visible if we receive an error from the api
      const belastingenActive =
        FeatureToggle.belastingApiActive && BELASTINGEN?.status === 'OK'
          ? BELASTINGEN.content?.isKnown
          : true;
      return !isLoading(BELASTINGEN) && belastingenActive;
    }

    case ThemaIDs.MILIEUZONE:
      return (
        !isLoading(MILIEUZONE) &&
        (FeatureToggle.cleopatraApiActive ? MILIEUZONE.content?.isKnown : false)
      );

    case ThemaIDs.OVERTREDINGEN:
      return (
        !isLoading(OVERTREDINGEN) &&
        (FeatureToggle.cleopatraApiActive && FeatureToggle.overtredingenActive
          ? OVERTREDINGEN.content?.isKnown
          : false)
      );

    case ThemaIDs.ERFPACHT:
      return (
        FeatureToggle.erfpachtActive &&
        !isLoading(ERFPACHT) &&
        ERFPACHT.content !== null &&
        (('dossiers' in ERFPACHT.content &&
          !!ERFPACHT.content.dossiers.dossiers?.length) ||
          !!ERFPACHT.content?.isKnown)
      );

    case ThemaIDs.SUBSIDIE:
      return !isLoading(SUBSIDIE) && SUBSIDIE.content?.isKnown === true;

    case ThemaIDs.BURGERZAKEN: {
      const hasIdentiteitsbewijs = !!BRP?.content?.identiteitsbewijzen?.length;
      return (
        FeatureToggle.identiteitsbewijzenActive &&
        !isLoading(BRP) &&
        hasIdentiteitsbewijs
      );
    }

    case ThemaIDs.VERGUNNINGEN:
      return !isLoading(VERGUNNINGEN) && !!VERGUNNINGEN.content?.length;

    case ThemaIDs.TOERISTISCHE_VERHUUR: {
      const { lvvRegistraties, vakantieverhuurVergunningen, bbVergunningen } =
        TOERISTISCHE_VERHUUR?.content ?? {};
      const hasRegistraties = !!lvvRegistraties?.length;
      const hasVergunningen =
        !!vakantieverhuurVergunningen?.length || !!bbVergunningen?.length;
      return (
        !isLoading(TOERISTISCHE_VERHUUR) && (hasRegistraties || hasVergunningen)
      );
    }

    case ThemaIDs.KREFIA:
      return !isLoading(KREFIA) && !!KREFIA.content?.deepLinks.length;

    case ThemaIDs.PARKEREN: {
      const hasDecosParkeerVergunningen =
        !!appState.PARKEREN?.content?.vergunningen?.length;

      return (
        FeatureToggle.parkerenActive &&
        !isLoading(PARKEREN) &&
        (!!PARKEREN?.content?.isKnown || hasDecosParkeerVergunningen)
      );
    }

    case ThemaIDs.KLACHTEN:
      return (
        !isLoading(KLACHTEN) &&
        !!KLACHTEN?.content?.klachten.length &&
        FeatureToggle.klachtenActive
      );

    case ThemaIDs.VAREN:
      return (
        !isLoading(VAREN) &&
        (!!VAREN?.content?.reder || !!VAREN?.content?.zaken?.length) &&
        FeatureToggle.varenActive
      );

    case ThemaIDs.HORECA:
      return (
        !isLoading(HORECA) &&
        !!HORECA?.content?.length &&
        FeatureToggle.horecaActive
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
