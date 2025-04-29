import { AuthProfileAndToken } from '../../auth/auth-types';
import { fetchDocument } from '../zorgned/zorgned-service';

export async function fetchZorgnedLLVDocument(
  authProfileAndToken: AuthProfileAndToken,
  documentId: string
) {
  const response = fetchDocument(
    authProfileAndToken,
    'ZORGNED_LEERLINGENVERVOER',
    documentId
  );
  return response;
}
