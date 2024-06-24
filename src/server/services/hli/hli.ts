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
  const regelingen: HLIRegeling[] = [
    'Aanvullende inkomensvoorziening ouderen',
    'Bijzondere bijstand voor kosten die u zelf niet kunt betalen',
    'Collectieve zorgverzekering',
    'Eigen bijdrage Wmo betalen',
    'Energietoeslag en Bijzondere bijstand hoge energiekosten',
    'Extra geld als u al lang een laag inkomen hebt/Individuele inkomenstoeslag',
    'Extra geld als u chronisch ziek of gehandicapt bent/Regeling tegemoetkoming meerkosten',
    'Geld lenen bij de Kredietbank',
    'Gratis identiteitskaart',
    'Gratis laptop of tablet basisschool',
    'Gratis laptop of tablet voor middelbare school',
    'Gratis menstruatieproducten',
    'Gratis met bus, tram en metro voor AOW-ers',
    'Hulp voor huiseigenaren bij schulden',
    'Huurverlaging als uw huur te hoog is voor uw inkomen',
    'Kindtegoed Stadspas',
    'Kindtegoed voorschool',
    'Kwijtschelding gemeentebelastingen',
    'OV-vergoeding voor mantelzorgers',
    'Reiskostenvergoeding voor middelbare scholieren',
    'Scholingslening',
    'Scholingsvoucher',
    'Sport en cultuur voor kinderen',
    'Stadspas',
    'Studietoeslag',
  ].map((omschrijving) => {
    return {
      id: `${Math.random() * 899}`,
      title: omschrijving, // Omschrijving
      supplier: 'Leverancier B.V', // Leverancier
      about: omschrijving, // TODO: implement
      isActual: true, // Indicates if this item is designated Current or Previous
      link: { title: omschrijving, to: '/' },
      steps: [],
      dateDescision: '2024-05-31',
      dateStart: '2024-05-31',
      dateEnd: '',
    };
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
    regelingen: getSettledResult(regelingenResult).content,
    stadspas: getSettledResult(stadspasResult).content,
  };

  return apiSuccessResult(
    HLIResponseData,
    getFailedDependencies(HLIResponseData)
  );
}
