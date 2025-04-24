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
    KVK,
    MILIEUZONE,
    OVERTREDINGEN,
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

    case ThemaIDs.SUBSIDIE:
      return !isLoading(SUBSIDIE) && SUBSIDIE.content?.isKnown === true;

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

    case ThemaIDs.VAREN:
      return (
        !isLoading(VAREN) &&
        (!!VAREN?.content?.reder || !!VAREN?.content?.zaken?.length) &&
        FeatureToggle.varenActive
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
