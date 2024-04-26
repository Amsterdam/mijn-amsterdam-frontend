import { getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import { Woning, Woningen } from './types';
import { BRPData } from '../../../universal/types';

export function getDataForWonen(authProfileAndToken: AuthProfileAndToken) {
  if (authProfileAndToken.profile.authMethod === 'digid') {
    return {
      bsn: authProfileAndToken.profile.id ?? '',
    };
  }

  if (authProfileAndToken.profile.authMethod === 'eherkenning') {
    return {
      kvk: authProfileAndToken.profile.id ?? '',
    };
  }
}

function transformDSOAPIResponse(response: any) {
  let woningen: Woning[] = [];
  if (!response._embedded) {
    return { woningen };
  }

  try {
    const sourceData: Woning[] = response._embedded.energielabel;
    // Todo check on list lenght != 1 --> do something
    woningen = [
      {
        id: sourceData[0].id,
        opnamedatum: sourceData[0].opnamedatum,
        opnametype: sourceData[0].opnametype,
        status: sourceData[0].status,
        berekeningstype: sourceData[0].berekeningstype,
        energieindex: sourceData[0].energieindex,
        energieklasse: sourceData[0].energieklasse,
        energielabelIsPrive: sourceData[0].energielabelIsPrive,
        isOpBasisVanReferentieGebouw:
          sourceData[0].isOpBasisVanReferentieGebouw,
        gebouwklasse: sourceData[0].gebouwklasse,
        metingGeldigTot: sourceData[0].metingGeldigTot,
        registratiedatum: sourceData[0].registratiedatum,
        postcode: sourceData[0].postcode,
        huisnummer: sourceData[0].huisnummer,
        huisletter: sourceData[0].huisletter,
        huisnummertoevoeging: sourceData[0].huisnummertoevoeging,
        detailaanduiding: sourceData[0].detailaanduiding,
        bagVerblijfsobjectId: sourceData[0].bagVerblijfsobjectId,
        bagLigplaatsId: sourceData[0].bagLigplaatsId,
        bagStandplaatsId: sourceData[0].bagStandplaatsId,
        bagPandId: sourceData[0].bagPandId,
        gebouwtype: sourceData[0].gebouwtype,
        gebouwsubtype: sourceData[0].gebouwsubtype,
        projectnaam: sourceData[0].projectnaam,
        projectobject: sourceData[0].projectobject,
        sbicode: sourceData[0].sbicode,
        gebruiksoppervlakteThermischeZone:
          sourceData[0].gebruiksoppervlakteThermischeZone,
        energiebehoefte: sourceData[0].energiebehoefte,
        eisEnergiebehoefte: sourceData[0].eisEnergiebehoefte,
        primaireFossieleEnergie: sourceData[0].primaireFossieleEnergie,
        eisPrimaireFossieleEnergie: sourceData[0].eisPrimaireFossieleEnergie,
        primaireFossieleEnergieEmgForfaitair:
          sourceData[0].primaireFossieleEnergieEmgForfaitair,
        aandeelHernieuwbareEnergie: sourceData[0].aandeelHernieuwbareEnergie,
        eisAandeelHernieuwbareEnergie:
          sourceData[0].eisAandeelHernieuwbareEnergie,
        aandeelHernieuwbareEnergieEmgForfaitair:
          sourceData[0].aandeelHernieuwbareEnergieEmgForfaitair,
        temperatuuroverschrijding: sourceData[0].temperatuuroverschrijding,
        eisTemperatuuroverschrijding:
          sourceData[0].eisTemperatuuroverschrijding,
        warmtebehoefte: sourceData[0].warmtebehoefte,
        energieindexMetEmgForfaitair:
          sourceData[0].energieindexMetEmgForfaitair,
      },
    ];
  } catch (e) {
    // TODO: App insights
    console.log('ERROR', e);
    // Sentry.captureException(e);
  }
  return { woningen };
}
interface TokenResponse {
  access_token: string;
}
async function getAccessToken(requestID: requestID) {
  const data = `grant_type=client_credentials&client_id=${process.env.BFF_SIA_IAM_CLIENT_ID}&client_secret=${process.env.BFF_SIA_IAM_CLIENT_SECRET}`;

  return requestData<TokenResponse>(
    {
      method: 'post',
      url: `${process.env.BFF_SIA_IAM_TOKEN_ENDPOINT}`,
      data,
    },
    requestID
  );
}

export async function fetchWonen(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  // const data = getDataForWonen(authProfileAndToken); // bsn

  const wonenRequestConfig = getApiConfig('WONEN', {
    transformResponse: transformDSOAPIResponse,
  });

  // const accessToken = getAccessToken(requestID);
  // console.log(accessToken);
  // const wonenKwaliteitsMonitorRequestConfig = getApiConfig('WONEN_KWALITEITSMONITOR', {
  //   transformResponse: transformDSOAPIResponse,
  //   headers: {
  //     Authorization: `Bearer ${accessToken}`,
  //   },
  // });
  const BRPrequestConfig = getApiConfig('BRP', {
    transformResponse: transformDSOAPIResponse,
  });

  const BRPResponse = await requestData<BRPData>(BRPrequestConfig, requestID);

  // No energielabel known for Stopera, comment the request url to use the default response
  const postcode = BRPResponse.content?.adres.postcode?.replace(/\s+/g, '');
  // wonenRequestConfig.url = `${wonenRequestConfig.url}?postcode=${postcode}&huisn>ummer=${BRPResponse.content?.adres.huisnummer}`;

  const result = await requestData<Woningen>(wonenRequestConfig, requestID);
  return result;
}
