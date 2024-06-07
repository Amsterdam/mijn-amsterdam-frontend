import { generatePath } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config';
import {
  apiSuccessResult,
  capitalizeFirstLetter,
  dateSort,
  getFailedDependencies,
  getSettledResult,
} from '../../../universal/helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import { ZorgnedAanvraagTransformed } from '../zorgned/zorgned-config-and-types';
import { getStatusLineItems } from '../zorgned/zorgned-status-line-items';
import { hliStatusLineItemsConfig } from './hli-status-line-items';
import { fetchZorgnedAanvragenHLI } from './hli-zorgned-service';
import { HLIRegeling } from './regelingen-types';
import { fetchStadspas } from './stadspas';

function getFakeResponse(regelingenFrontend: HLIRegeling[]) {
  const route = generatePath(AppRoutes['HLI/REGELING'], {
    id: '123123123',
    regeling: 'hli-regeling',
  });
  const regelingen: HLIRegeling[] = [
    'Collectieve Ziektekosten Voorziening',
    'Gratis openbaar vervoer voor ouderen',
    'Individuele inkomenstoeslag',
    'Kindtegoed Voorschool',
    'Openbaar Vervoer voor Mantelzorgers',
    'Gratis laptop of tablet middelbare school',
    'Stadspas',
    'Tegemoetkoming Aanvullend Openbaar Vervoer voor ouderen',
    'Gratis laptop of tablet basisschool',
  ].map((omschrijving) => {
    const aanvraag: HLIRegeling = {
      id: `123123123`,
      title: omschrijving, // Omschrijving
      supplier: 'Leverancier B.V', // Leverancier
      about: omschrijving, // TODO: implement
      isActual: true, // Indicates if this item is designated Current or Previous
      link: { title: omschrijving, to: route },
      steps: [
        {
          status: 'Besluit',
          isActive: true,
          isChecked: true,
          datePublished: '2024-05-31',
        },
        {
          status: 'Einde recht',
          isActive: false,
          isChecked: false,
          datePublished: '',
        },
      ],
      dateDescision: '2024-05-31',
      dateStart: '2024-05-31',
      dateEnd: '',
    };
    return aanvraag;
  });

  return regelingen;
}

export function transformRegelingenForFrontend(
  sessionID: AuthProfileAndToken['profile']['sid'],
  aanvragen: ZorgnedAanvraagTransformed[],
  today: Date
): HLIRegeling[] {
  const regelingenFrontend: HLIRegeling[] = [];

  for (const aanvraag of aanvragen) {
    const id = aanvraag.id;

    const statusLineItems = getStatusLineItems(
      'HLI',
      hliStatusLineItemsConfig,
      aanvraag,
      today
    );

    if (!Array.isArray(statusLineItems) || !statusLineItems.length) {
      continue;
    }

    const route = generatePath(AppRoutes['HLI/REGELING'], {
      id,
    });

    if (statusLineItems) {
      const regelingFrontend: HLIRegeling = {
        id,
        title: capitalizeFirstLetter(aanvraag.titel),
        supplier: aanvraag.leverancier,
        isActual: aanvraag.isActueel,
        link: {
          title: 'Meer informatie',
          to: route,
        },
        steps: statusLineItems,
        dateDescision: aanvraag.datumBesluit,
        dateStart: aanvraag.datumIngangGeldigheid,
        dateEnd: aanvraag.datumEindeGeldigheid,
      };

      regelingenFrontend.push(regelingFrontend);
    }
  }

  regelingenFrontend.sort(dateSort('dateStart', 'desc'));

  return getFakeResponse(regelingenFrontend);
}

async function fetchRegelingen(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const aanvragenResponse = await fetchZorgnedAanvragenHLI(
    requestID,
    authProfileAndToken
  );
  if (aanvragenResponse.status === 'OK') {
    const regelingen = transformRegelingenForFrontend(
      authProfileAndToken.profile.sid,
      aanvragenResponse.content,
      new Date()
    );
    return apiSuccessResult(regelingen);
  }
  return aanvragenResponse;
}

export async function fetchHLI(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const [stadspasResult, regelingenResult] = await Promise.allSettled([
    fetchStadspas(requestID, authProfileAndToken),
    fetchRegelingen(requestID, authProfileAndToken),
  ]);

  const HLIResponseData = {
    regelingen: getSettledResult(regelingenResult).content ?? [],
    stadspas: getSettledResult(stadspasResult).content,
  };

  return apiSuccessResult(
    HLIResponseData,
    getFailedDependencies(HLIResponseData)
  );
}
