import { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { fetchDocument } from '../zorgned/zorgned-service.ts';

export async function fetchZorgnedLLVDocument(
  authProfileAndToken: AuthProfileAndToken,
  documentId: string
) {
  const response = fetchDocument(
    authProfileAndToken.profile.id,
    'ZORGNED_LEERLINGENVERVOER',
    documentId
  );
  return response;
}
