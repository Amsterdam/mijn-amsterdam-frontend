import { performance } from 'node:perf_hooks';

import type { AxiosResponse } from 'axios';
import type { Router } from 'express';

import { decryptEncryptedRouteParamAndValidateSessionID } from './decrypt-route-param.ts';
import type {
  ApiErrorResponse,
  ApiPostponeResponse,
  ApiSuccessResponse,
} from '../../../universal/helpers/api.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import type { RequestWithRouteAndQueryParams } from '../../routing/route-helpers.ts';
import {
  sendDocumentDownloadResponse,
  sendResponse,
  type RecordStr2,
  type ResponseAuthenticated,
} from '../../routing/route-helpers.ts';

export const DEFAULT_DOCUMENT_DOWNLOAD_MIME_TYPE = 'application/pdf';
export const DEFAULT_DOCUMENT_DOWNLOAD_FILENAME = 'zaak-document.pdf';

export type DocumentDownloadData = {
  data: AxiosResponse['data'] | Buffer;
  mimetype?: string;
  filename?: string;
};

export type DocumentDownloadResponse =
  | ApiSuccessResponse<DocumentDownloadData>
  | ApiErrorResponse<null>
  | ApiPostponeResponse<null>;

export type FetchDocumentDownloadService = (
  authProfileAndToken: AuthProfileAndToken,
  documentIDEncrypted: string,
  queryParams?: RecordStr2
) => Promise<DocumentDownloadResponse>;

type FetchRouteOrQueryParamsFN = (
  req: RequestWithRouteAndQueryParams<{ id: string }, { id: string }>
) => string;

export function downloadDocumentRouteHandler(
  fetchDocument: FetchDocumentDownloadService,
  getRouteOrQueryParams: FetchRouteOrQueryParamsFN = (
    req: RequestWithRouteAndQueryParams<{ id: string }, { id: string }>
  ) => req.query.id || req.params.id,
  timingLabel?: string
) {
  return async function handleDownloadRoute(
    req: RequestWithRouteAndQueryParams<
      { id: string },
      { id: string; [key: string]: string }
    >,
    res: ResponseAuthenticated
  ) {
    const requestStartedAt = performance.now();
    const decryptResult = decryptEncryptedRouteParamAndValidateSessionID(
      // TODO: params.id should be removed, BFF routes should use queryParams for handling route/service variables.
      getRouteOrQueryParams(req),
      res.locals.authProfileAndToken
    );

    if (decryptResult.status === 'OK') {
      const documentResponse = await fetchDocument(
        res.locals.authProfileAndToken,
        decryptResult.content,
        req.query as RecordStr2
      );

      if (timingLabel) {
        const data =
          documentResponse.status === 'OK'
            ? documentResponse.content.data
            : undefined;
        const byteLength = Buffer.isBuffer(data) ? data.length : undefined;
        res.once('finish', () => {
          // eslint-disable-next-line no-console -- Temporary diagnostics for large AFIS downloads.
          console.log(
            `[${timingLabel}] BFF response finished in ${(performance.now() - requestStartedAt).toFixed(1)} ms${byteLength === undefined ? '' : ` (${(byteLength / 1024 / 1024).toFixed(1)} MiB)`}`
          );
        });
      }

      return sendDocumentDownloadResponse(res, documentResponse);
    }

    return sendResponse(res, decryptResult);
  };
}

export function attachDocumentDownloadRoute(
  router: Router,
  route: string,
  fetchDocumentService: FetchDocumentDownloadService,
  getRouteOrQueryParams?: FetchRouteOrQueryParamsFN,
  timingLabel?: string
) {
  router.get(
    route,
    downloadDocumentRouteHandler(
      fetchDocumentService,
      getRouteOrQueryParams,
      timingLabel
    )
  );
}
