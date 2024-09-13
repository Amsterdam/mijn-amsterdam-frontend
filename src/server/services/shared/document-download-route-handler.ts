import { AxiosResponse } from 'axios';
import { Request, Response, Router } from 'express';
import {
  ApiErrorResponse,
  ApiPostponeResponse,
  ApiSuccessResponse,
} from '../../../universal/helpers/api';
import { getAuth } from '../../auth/auth-helpers';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { decryptEncryptedRouteParamAndValidateSessionID } from './decrypt-route-param';
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
  | ApiPostponeResponse;

export type FetchDocumenDownloadService = (
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  documentIDEncrypted: string,
  queryParams?: Record<string, string>
) => Promise<DocumentDownloadResponse>;

export function downloadDocumentRouteHandler(
  fetchDocument: FetchDocumenDownloadService
) {
  return async function handleDownloadRoute(
    req: Request<{ id: string }>,
    res: Response
  ) {
    const authProfileAndToken = await getAuth(req);

    const decryptResult = decryptEncryptedRouteParamAndValidateSessionID(
      req.params.id,
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
        return res.status(500).send(documentResponse);
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

    return res.status(400).send(decryptResult);
  };
}

export function attachDocumentDownloadRoute(
  router: Router,
  route: string,
  fetchDocumentService: FetchDocumenDownloadService
) {
  if (!route.split('/').includes(':id')) {
    throw new Error('Document download route requires an :id path parameter.');
  }
  router.get(route, downloadDocumentRouteHandler(fetchDocumentService));
}
