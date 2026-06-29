import type { WMOVoorzieningFrontend } from '../../../../server/services/jzd/wmo/wmo-types.ts';

export function isVoorzieningActieAvailable(
  voorziening: WMOVoorzieningFrontend,
  actie: string,
  withUrlCheck = true
): boolean {
  if (voorziening?.maActies?.includes(actie)) {
    if (withUrlCheck) {
      return !!voorziening?.maActieUrls?.[actie];
    }
    return true;
  }
  return false;
}
