import { Entries } from 'type-fest';

import { FeatureToggle } from '../../universal/config/feature-toggles';
import { Themas } from '../../universal/config/thema';
import { isLoading } from '../../universal/helpers/api';
import { isMokum } from '../../universal/helpers/brp';
import { AppState, AppStateKey } from '../../universal/types/App.types';
import {
  ThemaMenuItem,
  ThemaRouteConfig,
  ThemaRoutesConfig,
} from '../config/thema-types';

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
    WMO,
  }: AppState = appState;

  const isAmsterdam = isMokum(BRP?.content) || isMokum(KVK?.content);

  switch (item.id) {
    case Themas.AFIS: {
      return FeatureToggle.afisActive && AFIS?.content?.isKnown;
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
      return (
        FeatureToggle.erfpachtActive &&
        !isLoading(ERFPACHT) &&
        ERFPACHT.content !== null &&
        (('dossiers' in ERFPACHT.content &&
          !!ERFPACHT.content.dossiers.dossiers?.length) ||
          !!ERFPACHT.content?.isKnown)
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

    case Themas.VERGUNNINGEN:
      return !isLoading(VERGUNNINGEN) && !!VERGUNNINGEN.content?.length;

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
      return !isLoading(KREFIA) && !!KREFIA.content?.deepLinks.length;

    case Themas.PARKEREN: {
      const hasDecosParkeerVergunningen =
        !!appState.PARKEREN?.content?.vergunningen?.length;

      return (
        FeatureToggle.parkerenActive &&
        !isLoading(PARKEREN) &&
        (!!PARKEREN?.content?.isKnown || hasDecosParkeerVergunningen)
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
        (!!VAREN?.content?.reder || !!VAREN?.content?.zaken?.length) &&
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

export function toMapped<
  T extends ThemaRoutesConfig,
  K extends keyof ThemaRouteConfig,
>(routeConfig: T, configKey: K) {
  const routeEntries = Object.entries(routeConfig) as Entries<
    typeof routeConfig
  >;
  type RC = typeof routeConfig;
  type RCK = keyof RC;

  return Object.fromEntries(
    routeEntries.map(([routeKey, config]) => {
      const routeConfigValue = config[configKey];
      return [routeKey, routeConfigValue];
    })
  ) as Record<RCK, ThemaRouteConfig[K]>;
}

export function toMappedByPath<
  T extends ThemaRoutesConfig,
  K extends keyof ThemaRouteConfig,
>(routeConfig: T, configKey: K) {
  const routeEntries = Object.entries(routeConfig) as Entries<
    typeof routeConfig
  >;
  return Object.fromEntries(
    routeEntries.map(([_routeKey, config]) => {
      const routeConfigValue = config[configKey];
      return [config.path, routeConfigValue];
    })
  );
}

export function toRoutes<T extends ThemaRoutesConfig>(routeConfig: T) {
  return toMapped(routeConfig, 'path');
}

export function toDocumentTitles<T extends ThemaRoutesConfig>(routeConfig: T) {
  return toMappedByPath(routeConfig, 'documentTitle');
}

export function toCustomTrackingUrls<T extends ThemaRoutesConfig>(
  routeConfig: T
) {
  return toMappedByPath(routeConfig, 'trackingUrl');
}
