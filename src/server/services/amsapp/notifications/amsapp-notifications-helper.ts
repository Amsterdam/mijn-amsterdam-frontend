import UID from 'uid-safe';

import type {
  AuthProfile,
  AuthProfileAndToken,
} from '../../../auth/auth-types';

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;
export const getSevenDaysAgoISOString = () =>
  new Date(Date.now() - SEVEN_DAYS_IN_MS).toISOString();

export function getAuthProfileAndTokenWithoutSession(
  profileId: AuthProfile['id']
): AuthProfileAndToken {
  const BYTE_LENGTH = 16;
  const authProfileAndToken = {
    profile: {
      authMethod: 'digid',
      profileType: 'private',
      sid: `overridden-${UID.sync(BYTE_LENGTH)}}`,
      id: profileId,
    } as const,
    token: 'notprovided',
    expiresAtMilliseconds: 1,
  };
  return authProfileAndToken;
}
