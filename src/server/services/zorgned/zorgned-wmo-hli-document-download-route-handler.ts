import { AuthProfileAndToken } from '../../helpers/app';
import { downloadDocumentRouteHandler } from '../shared/document-download-route-handler';
import { fetchDocument } from './zorgned-service';

export function downloadZorgnedDocument(
  zorgnedApiConfigKey: 'ZORGNED_JZD' | 'ZORGNED_AV'
) {
  function fetchZorgnedDocument(
    requestID: requestID,
    authProfileAndToken: AuthProfileAndToken,
    documentId: string
  ) {
    const response = fetchDocument(
      requestID,
      authProfileAndToken,
      zorgnedApiConfigKey,
      documentId
    );
    return response;
  }
  return fetchZorgnedDocument;
}
