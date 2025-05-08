import { decosZaakTransformers } from './decos-zaken';
import { fetchDecosParkeerVergunningen } from './parkeren-decos-service';
import {
  themaId,
  themaTitle,
} from '../../../client/pages/Thema/Parkeren/Parkeren-thema-config';
import {
  apiSuccessResult,
  apiDependencyError,
} from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { getVergunningNotifications } from '../vergunningen/vergunningen-notifications';

export async function fetchParkeerVergunningenNotifications(
  authProfileAndToken: AuthProfileAndToken
) {
  const VERGUNNINGEN = await fetchDecosParkeerVergunningen(authProfileAndToken);

  if (VERGUNNINGEN.status === 'OK') {
    const notifications = getVergunningNotifications<any>(
      VERGUNNINGEN.content,
      decosZaakTransformers,
      themaId,
      themaTitle
    );

    return apiSuccessResult({
      notifications,
    });
  }

  return apiDependencyError({ VERGUNNINGEN });
}
