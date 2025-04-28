import { decosZaakTransformers } from './decos-zaken';
import { fetchDecosParkeerVergunningen } from './parkeren-decos-service';
import { themaId as themaIdParkeren } from '../../../client/pages/Thema/Parkeren/Parkeren-thema-config';
import {
  apiSuccessResult,
  apiDependencyError,
} from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { getVergunningNotifications } from '../vergunningen/vergunningen-notifications';

export async function fetchParkeerVergunningenNotifications(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const VERGUNNINGEN = await fetchDecosParkeerVergunningen(
    requestID,
    authProfileAndToken
  );

  if (VERGUNNINGEN.status === 'OK') {
    const notifications = getVergunningNotifications<any>(
      VERGUNNINGEN.content,
      decosZaakTransformers,
      themaIdParkeren
    );

    return apiSuccessResult({
      notifications,
    });
  }

  return apiDependencyError({ VERGUNNINGEN });
}
