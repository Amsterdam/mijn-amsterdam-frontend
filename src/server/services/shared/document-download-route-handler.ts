import { AxiosResponse } from 'axios';
import { Request, Response, Router } from 'express';
import { IS_PRODUCTION } from '../../../universal/config';
import {
  ApiErrorResponse,
  ApiPostponeResponse,
  ApiSuccessResponse,
  apiErrorResult,
} from '../../../universal/helpers';
import { decrypt } from '../../../universal/helpers/encrypt-decrypt';
import { AuthProfileAndToken, getAuth } from '../../helpers/app';
import { captureException } from '../monitoring';

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

    let documentId: string = '';
    let sessionID: string = '';

    try {
      [sessionID, documentId] = decrypt(req.params.id).split(':');
    } catch (error) {
      captureException(error);
    }

    if (!documentId || sessionID !== authProfileAndToken.profile.sid) {
      let message = 'Not authorized';
      if (!IS_PRODUCTION) {
        message = `${message}${!documentId || !sessionID ? ' -  documentID or sessionID is missing' : ''}`;
      }
      return res.status(401).send(apiErrorResult(message, null, 401));
    }

    const documentResponse = await fetchDocument(
      res.locals.requestID,
      authProfileAndToken,
      documentId,
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
      res.type(
        documentResponse.content.mimetype ?? DEFAULT_DOCUMENT_DOWNLOAD_MIME_TYPE
      );
    }
    res.header(
      'Content-Disposition',
      `attachment${documentResponse.content.filename ? `;${documentResponse.content.filename}` : ''}`
    );
    return 'pipe' in documentResponse.content.data &&
      typeof documentResponse.content.data.pipe === 'function'
      ? documentResponse.content.data.pipe(res)
      : res.send(documentResponse.content.data);
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
