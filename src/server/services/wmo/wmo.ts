import { generatePath } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config';
import {
  apiSuccessResult,
  capitalizeFirstLetter,
  dateSort,
} from '../../../universal/helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import {
  MINIMUM_REQUEST_DATE_FOR_DOCUMENTS,
  WMOVoorziening,
  WMOVoorzieningFrontend,
} from './wmo-config-and-types';
import { getStatusLineItems } from './status-line-items/wmo-status-line-items';
import { fetchVoorzieningen } from './wmo-zorgned-service';
import { parseISO } from 'date-fns';

export function transformVoorzieningenForFrontend(
  voorzieningen: WMOVoorziening[],
  today: Date
): WMOVoorzieningFrontend[] {
  const voorzieningenFrontend: WMOVoorzieningFrontend[] = [];
  const voorzieningenVisible = voorzieningen.filter((voorziening) => {
    return parseISO(voorziening.datumAanvraag) >
      MINIMUM_REQUEST_DATE_FOR_DOCUMENTS
      ? !!voorziening.documenten?.length
      : parseISO(voorziening.datumAanvraag) <
          MINIMUM_REQUEST_DATE_FOR_DOCUMENTS;
  });

  for (const voorziening of voorzieningenVisible) {
    const id = voorziening.id;
    const statusLineItems = getStatusLineItems(voorziening, today);
    const route = generatePath(AppRoutes['ZORG/VOORZIENINGEN'], {
      id,
    });

    if (statusLineItems) {
      const voorzieninFrontend: WMOVoorzieningFrontend = {
        id,
        title: capitalizeFirstLetter(voorziening.titel),
        supplier: voorziening.leverancier,
        isActual: voorziening.isActueel,
        link: {
          title: 'Meer informatie',
          to: route,
        },
        steps: statusLineItems,
        // NOTE: Keep! This field is added specifically for the Tips api.
        itemTypeCode: voorziening.productsoortCode,
        dateDescision: voorziening.datumBesluit,
        dateStart: voorziening.datumIngangGeldigheid,
        dateEnd: voorziening.datumEindeGeldigheid,
      };

      voorzieningenFrontend.push(voorzieninFrontend);
    }
  }

  voorzieningenFrontend.sort(dateSort('dateStart', 'desc'));

  return voorzieningenFrontend;
}

export async function fetchWmo(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const voorzieningenResponse = await fetchVoorzieningen(
    requestID,
    authProfileAndToken
  );

  if (voorzieningenResponse.status === 'OK') {
    const voorzieningenFrontend = transformVoorzieningenForFrontend(
      voorzieningenResponse.content,
      new Date()
    );
    return apiSuccessResult(voorzieningenFrontend);
  }

  return voorzieningenResponse;
}
