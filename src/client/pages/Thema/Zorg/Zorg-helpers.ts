import type { WMOVoorzieningFrontend } from '../../../../server/services/jzd/wmo/wmo-types.ts';

export function isVoorzieningActieAvailable(
  voorziening: WMOVoorzieningFrontend,
  actie: string,
  withUrlCheck = true
): boolean {
  return !!(
    voorziening?.maActies?.includes(actie) &&
    (!withUrlCheck || voorziening?.maActieUrls?.[actie])
  );
}
