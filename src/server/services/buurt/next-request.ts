import { AxiosResponseHeaders } from 'axios';
import { DataRequestConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { requestData } from '../../helpers';

export async function checkNextRequest<T>(
  requestConfig: DataRequestConfig,
  response: any,
  requestID: string,
  authProfileAndToken: AuthProfileAndToken | undefined
) {
  if (
    requestConfig?.page &&
    requestConfig?.maximumAmountOfPages &&
    requestConfig?.page < requestConfig?.maximumAmountOfPages &&
    response.headers?.link?.includes('rel="next"') &&
    typeof requestConfig.combinePaginatedResults === 'function'
  ) {
    const headers = response.headers;

    const nextUrl = getNextUrlFromLinkHeader(headers as AxiosResponseHeaders);

    const newRequest = {
      ...requestConfig,
      url: nextUrl,
      page: requestConfig.page + 1,
    };

    response.data = await requestConfig.combinePaginatedResults<T>(
      response.data,
      await requestData(newRequest, requestID, authProfileAndToken),
      requestConfig.url as string,
      nextUrl
    );
  }
}

export function getNextUrlFromLinkHeader(headers: AxiosResponseHeaders) {
  // parse link header and get value of rel="next" url
  const links = headers.link.split(',');
  const next = links.find(
    (link: string) => link.includes('rel="next"') && link.includes(';')
  );
  if (next === undefined) {
    throw new Error('Something went wrong while parsing the link header.');
  }

  const rawUrl = next.split(';')[0].trim();
  return rawUrl.substring(1, rawUrl.length - 1); // The link values should according to spec be wrapped in <> so we need to strip those.
}
