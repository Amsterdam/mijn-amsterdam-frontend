import { themaConfig } from '../../../client/apps/bob/pages/Thema/Parkeren/Parkeren-thema-config.ts';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers/api.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { getVergunningNotifications } from '../vergunningen/vergunningen-notifications.ts';
import { fetchDecosParkeerVergunningen } from './parkeren-decos-service.ts';

export async function fetchParkeerVergunningenNotifications(
  authProfileAndToken: AuthProfileAndToken
) {
  const VERGUNNINGEN = await fetchDecosParkeerVergunningen(authProfileAndToken);

  if (VERGUNNINGEN.status === 'OK') {
    const notifications = getVergunningNotifications(
      VERGUNNINGEN.content,
      themaConfig.id,
      themaConfig.title
    );

    return apiSuccessResult({
      notifications,
    });
  }

  return apiDependencyError({ VERGUNNINGEN });
}
