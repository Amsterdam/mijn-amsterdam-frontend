import { IS_AP } from '../../universal/config';
import { ApiResponse } from '../../universal/helpers';
import { getApiConfig } from '../config';
import FileCache from '../helpers/file-cache';
import { requestData } from '../helpers/source-api-request';
import { sanitizeCmsContent } from './cms-content';

const fileCache = new FileCache({
  name: 'cms-maintenance-notifications',
  cacheTimeMinutes: IS_AP ? 24 * 60 : -1, // 24 hours
});

interface CMSArticle {
  title: string;
  content: string;
  source_url: string;
}

export interface CMSMaintenanceNotification {
  title: string;
  dateStart: string;
  page: string;
  dateEnd: string;
  description: string;
}

export type CMSMaintenanceNotifications = CMSMaintenanceNotification[];

export async function fetchCMSMaintenanceNotifications(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  params?: Record<string, string>
): Promise<ApiResponse<CMSMaintenanceNotifications>> {
  const apiData = fileCache.getKey('CMS_MAINTENANCE_NOTIFICATIONS');

  if (apiData) {
    return Promise.resolve(apiData);
  }

  const requestConfig = getApiConfig('CMS_MAINTENANCE_NOTIFICATIONS', {
    transformResponse: (responseData: any): CMSMaintenanceNotifications => {
      return responseData.map((article: CMSArticle) => {
        return {
          title: article.title,
          description: sanitizeCmsContent(article.content),
          dateStart: '',
          dateEnd: '',
          page: article.source_url.split('/').slice(-2, -1)[0],
        };
      });
    },
  });

  const response = await requestData<CMSMaintenanceNotifications>(
    requestConfig,
    sessionID
  )
    .then((apiData) => {
      if (apiData.content) {
        fileCache.setKey('CMS_MAINTENANCE_NOTIFICATIONS', apiData);
        fileCache.save();
        return apiData;
      }
      throw new Error('Unexpected page data from iProx CMS');
    })
    .catch((error) => {
      // Try to get stale cache instead.
      const staleApiData = fileCache.getKeyStale(
        'CMS_MAINTENANCE_NOTIFICATIONS'
      );

      if (staleApiData) {
        return Promise.resolve(staleApiData);
      }

      throw error;
    });

  return response;
}
