import type { VoorzieningActiePropsFrontend } from '../../../../../../server/services/jzd/jzd-types.ts';

export function isVoorzieningActieAvailable(
  voorziening: VoorzieningActiePropsFrontend,
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
