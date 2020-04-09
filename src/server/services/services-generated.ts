import { fetchTIPS, TIPSRequestData } from './tips';
import { dataCache } from './sourceApiResponseCache';
import { loadServicesRelated } from './services-related';
import { omit } from '../../universal/helpers';
import { loadServicesDirect } from './services-direct';
import { MyNotification, MyCase } from '../../universal/types/App.types';

export async function loadServicesGenerated(
  sessionID: SessionID,
  optin: boolean = false
) {
  const [relatedServicesData, directServicesData] = await Promise.all([
    loadServicesRelated(sessionID),
    loadServicesDirect(sessionID),
  ]);

  const tipsRequestData: TIPSRequestData = {
    data: {},
    optin,
  };

  const notifications: MyNotification[] = [];
  const cases: MyCase[] = [];

  // Collect the success response data from the service results and send to the tips Api.
  for (const [apiStateKey, responseData] of Object.entries({
    ...relatedServicesData,
    ...directServicesData,
  })) {
    if (responseData.status === 'success') {
      tipsRequestData.data[apiStateKey] = omit(responseData.content, [
        'notifications',
        'cases',
      ]);
    }

    if (responseData.status === 'mixed') {
      tipsRequestData.data[apiStateKey] = Object.entries(
        responseData.content
      ).reduce((acc, [key, responseData]) => {
        // NOTE: make sure the success response data doesn't return a status key with value success.
        if ('status' in responseData && responseData.status === 'success') {
          return Object.assign(acc, key, responseData.content);
        }
        return acc;
      }, {});
    }

    // Collection notifications and cases
    if (responseData.status === 'success' || responseData.status === 'mixed') {
      if ('notifications' in responseData.content) {
        notifications.push(...responseData.content.notifications);
      }

      if ('cases' in responseData.content) {
        cases.push(...responseData.content.cases);
      }
    }
  }

  const promiseTIPS = fetchTIPS(tipsRequestData);
  const tips: ResolvedType<typeof promiseTIPS> = await dataCache.add(
    sessionID,
    'TIPS',
    promiseTIPS
  );

  return {
    cases,
    notifications,
    tips,
  };
}
