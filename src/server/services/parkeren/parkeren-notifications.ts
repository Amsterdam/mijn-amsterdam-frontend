import { fetchDecosParkeerVergunningen } from './parkeren-decos-service.ts';
import {
  themaId,
  themaTitle,
} from '../../../client/pages/Thema/Parkeren/Parkeren-thema-config.ts';
import {
  apiSuccessResult,
  apiDependencyError,
} from '../../../universal/helpers/api.ts';
import { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { getVergunningNotifications } from '../vergunningen/vergunningen-notifications.ts';

export async function fetchParkeerVergunningenNotifications(
  authProfileAndToken: AuthProfileAndToken
) {
  const VERGUNNINGEN = await fetchDecosParkeerVergunningen(authProfileAndToken);

  if (VERGUNNINGEN.status === 'OK') {
    const notifications = getVergunningNotifications<any>(
      VERGUNNINGEN.content,
      themaId,
      themaTitle
    );

    return apiSuccessResult({
      notifications,
    });
  }

  return apiDependencyError({ VERGUNNINGEN });
}
