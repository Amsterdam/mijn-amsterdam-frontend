import { generatePath } from 'react-router-dom';
import { AppRoutes, IS_OT, IS_TEST } from '../../../universal/config';
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
import { HLIRegeling, HLIresponseData } from './regelingen-types';
import { fetchStadspas } from './stadspas';
import { REGELING } from './status-line-items/regeling';
import { StatusLineItem } from '../../../universal/types';

function getFakeResponse(regelingenFrontend: HLIRegeling[]) {
  const route = generatePath(AppRoutes['HLI/REGELING'], {
    id: '123123123',
    regeling: 'hli-regeling',
  });
  const regelingen: HLIRegeling[] = [
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
      receiverName: 'T.B Determined',
      displayStatus: 'Toegewezen',
      steps: [
        {
          status: 'Besluit',
          isActive: true,
          isChecked: true,
          datePublished: '2024-05-31',
          decision: 'toegewezen',
          description:
            typeof REGELING[0].description === 'function'
              ? REGELING[0].description(
                  {
                    resultaat: 'toegewezen',
                    titel: omschrijving,
                    datumIngangGeldigheid: '2024-05-31',
                  } as ZorgnedAanvraagTransformed,
                  new Date()
                )
              : '',
        },
        {
          status: 'Einde recht',
          isActive: false,
          isChecked: false,
          datePublished: '',
          description:
            typeof REGELING[1].description === 'function'
              ? REGELING[1].description(
                  {
                    resultaat: 'toegewezen',
                    titel: omschrijving,
                    datumIngangGeldigheid: '2024-05-31',
                    isActueel: true,
                  } as ZorgnedAanvraagTransformed,
                  new Date()
                )
              : '',
        },
      ],
      dateDescision: '2024-05-31',
      dateStart: '2024-05-31',
      dateEnd: '',
    };
    return aanvraag;
  });
  const route2 = generatePath(AppRoutes['HLI/REGELING'], {
    id: '9798989898',
    regeling: 'hli-regeling',
  });
  const afgewezen: HLIRegeling[] = [
    'Gratis openbaar vervoer voor ouderen',
    'Individuele inkomenstoeslag',
    'Gratis openbaar vervoer voor ouderen',
    'Individuele inkomenstoeslag',
    'Kindtegoed Voorschool',
    'Openbaar Vervoer voor Mantelzorgers',
    'Gratis laptop of tablet middelbare school',
    'Stadspas',
    'Kindtegoed Voorschool',
    'Gratis laptop of tablet basisschool',
    'Individuele inkomenstoeslag',
    'Gratis openbaar vervoer voor ouderen',
    'Individuele inkomenstoeslag',
    'Openbaar Vervoer voor Mantelzorgers',
    'Gratis openbaar vervoer voor ouderen',
    'Gratis laptop of tablet middelbare school',
    'Stadspas',
    'Tegemoetkoming Aanvullend Openbaar Vervoer voor ouderen',
    'Tegemoetkoming Aanvullend Openbaar Vervoer voor ouderen',
    'Gratis laptop of tablet basisschool',
  ].map((omschrijving) => {
    const aanvraag: HLIRegeling = {
      id: `9798989898`,
      title: omschrijving, // Omschrijving
      supplier: 'Leverancier B.V', // Leverancier
      about: omschrijving, // TODO: implement
      isActual: false, // Indicates if this item is designated Current or Previous
      link: { title: omschrijving, to: route2 },
      receiverName: 'Z.S Mogelijk',
      displayStatus: 'Niet verleend',
      steps: [
        {
          status: 'Besluit',
          isActive: true,
          isChecked: true,
          decision: 'afgewezen',
          datePublished: '2024-05-31',
          description:
            typeof REGELING[0].description === 'function'
              ? REGELING[0].description(
                  {
                    resultaat: 'afgewezen',
                    titel: omschrijving,
                    datumIngangGeldigheid: '2024-05-31',
                  } as ZorgnedAanvraagTransformed,
                  new Date()
                )
              : '',
        },
      ],
      dateDescision: '2024-05-31',
      dateStart: '2024-05-31',
      dateEnd: '',
    };
    return aanvraag;
  });

  return [...regelingen, ...afgewezen];
}

function getDisplayStatus(
  aanvraag: ZorgnedAanvraagTransformed,
  statusLineItems: StatusLineItem[]
) {
  switch (true) {
    case aanvraag.isActueel && aanvraag.resultaat === 'toegewezen':
      return 'Toegewezen';
    case !aanvraag.isActueel && aanvraag.resultaat === 'toegewezen':
      return 'Einde recht';
    case !aanvraag.isActueel && aanvraag.resultaat !== 'toegewezen':
      return 'Afgewezen';
  }
  return statusLineItems[statusLineItems.length - 1].status ?? 'NNB';
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
        displayStatus: getDisplayStatus(aanvraag, statusLineItems),
        receiverName: '',
      };

      regelingenFrontend.push(regelingFrontend);
    }
  }

  regelingenFrontend.sort(dateSort('dateStart', 'desc'));

  return IS_OT ? getFakeResponse(regelingenFrontend) : regelingenFrontend;
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

  const HLIResponseData: HLIresponseData = {
    regelingen: getSettledResult(regelingenResult).content ?? [],
    stadspas: getSettledResult(stadspasResult).content,
  };

  return apiSuccessResult(
    HLIResponseData,
    getFailedDependencies(HLIResponseData)
  );
}
