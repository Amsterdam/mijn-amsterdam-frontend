import { AuthProfileAndToken } from '../../helpers/app';
import { fetchDocument } from '../zorgned/zorgned-service';

export async function fetchZorgnedJZDDocument(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  documentId: string
) {
  const response = fetchDocument(
    requestID,
    authProfileAndToken,
    'ZORGNED_JZD',
    documentId
  );
  return response;
}
