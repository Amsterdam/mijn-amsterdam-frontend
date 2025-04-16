import type { Entries } from 'type-fest';

import { ThemaRoutesConfig, ThemaRouteConfig } from '../config/thema-types';

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
