import { AxiosResponse } from 'axios';
import { Response, Router } from 'express';

import { decryptEncryptedRouteParamAndValidateSessionID } from './decrypt-route-param';
import { HTTP_STATUS_CODES } from '../../../universal/constants/errorCodes';
import {
  ApiErrorResponse,
  ApiPostponeResponse,
  ApiSuccessResponse,
} from '../../../universal/helpers/api';
import { getAuth } from '../../auth/auth-helpers';
import { AuthProfileAndToken } from '../../auth/auth-types';
import {
  RequestWithRouteAndQueryParams,
  sendUnauthorized,
} from '../../routing/route-helpers';

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

export type FetchDocumenDownloadService = (
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  documentIDEncrypted: string,
  queryParams?: Record<string, string>
) => Promise<DocumentDownloadResponse>;

type FetRouteOrQueryParamsFN = (
  req: RequestWithRouteAndQueryParams<{ id: string }, { id: string }>
) => string;

export function downloadDocumentRouteHandler(
  fetchDocument: FetchDocumenDownloadService,
  getRouteOrQueryParams: FetRouteOrQueryParamsFN = (
    req: RequestWithRouteAndQueryParams<{ id: string }, { id: string }>
  ) => req.query.id || req.params.id
) {
  return async function handleDownloadRoute(
    req: RequestWithRouteAndQueryParams<
      { id: string },
      { id: string; [key: string]: string }
    >,
    res: Response
  ) {
    const authProfileAndToken = getAuth(req);

    if (authProfileAndToken) {
      const decryptResult = decryptEncryptedRouteParamAndValidateSessionID(
        // TODO: params.id should be removed, BFF routes should use queryParams for handling route/service variables.
        getRouteOrQueryParams(req),
        authProfileAndToken
      );

      if (decryptResult.status === 'OK') {
        const documentResponse = await fetchDocument(
          res.locals.requestID,
          authProfileAndToken,
          decryptResult.content,
          req.query as Record<string, string>
        );

        if (
          documentResponse.status === 'ERROR' ||
          documentResponse.status === 'POSTPONE'
        ) {
          return res
            .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
            .send(documentResponse);
        }

        if (
          'mimetype' in documentResponse.content &&
          documentResponse.content.mimetype
        ) {
          res.type(documentResponse.content.mimetype);
        }
        res.header(
          'Content-Disposition',
          `attachment${documentResponse.content.filename ? `;${documentResponse.content.filename}` : ''}`
        );
        return 'pipe' in documentResponse.content.data &&
          typeof documentResponse.content.data.pipe === 'function'
          ? documentResponse.content.data.pipe(res)
          : res.send(documentResponse.content.data);
      }

      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).send(decryptResult);
    }

    return sendUnauthorized(res);
  };
}

export function attachDocumentDownloadRoute(
  router: Router,
  route: string,
  fetchDocumentService: FetchDocumenDownloadService,
  getRouteOrQueryParams?: FetRouteOrQueryParamsFN
) {
  router.get(
    route,
    downloadDocumentRouteHandler(fetchDocumentService, getRouteOrQueryParams)
  );
}
