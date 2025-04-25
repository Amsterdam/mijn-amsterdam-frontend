import { AuthProfileAndToken } from '../../auth/auth-types';
import { fetchDocument } from '../zorgned/zorgned-service';

export async function fetchZorgnedLLVDocument(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  documentId: string
) {
  const response = fetchDocument(
    requestID,
    authProfileAndToken,
    'ZORGNED_LEERLINGENVERVOER',
    documentId
  );
  return response;
}
