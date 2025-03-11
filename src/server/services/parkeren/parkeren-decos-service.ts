import { DecosParkeerVergunning } from './config-and-types';
import { decosZaakTransformers } from './decos-zaken';
import { AppRoutes } from '../../../universal/config/routes';
import { ApiResponse, apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { fetchDecosZaken } from '../decos/decos-service';
import { VergunningFrontend } from '../vergunningen/config-and-types';
import { transformVergunningFrontend } from '../vergunningen/vergunningen';

export async function fetchDecosParkeerVergunningen(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<VergunningFrontend<DecosParkeerVergunning>[]>> {
  const response = await fetchDecosZaken(
    requestID,
    authProfileAndToken,
    decosZaakTransformers
  );

  if (response.status === 'OK') {
    const decosVergunningen = response.content;
    const vergunningenFrontend: VergunningFrontend<DecosParkeerVergunning>[] =
      decosVergunningen.map((vergunning) =>
        transformVergunningFrontend(
          authProfileAndToken.profile.sid,
          vergunning,
          AppRoutes['PARKEREN/DETAIL']
        )
      );
    return apiSuccessResult(vergunningenFrontend);
  }

  return response;
}
