import { AuthProfileAndToken } from '../../auth/auth-types';
import { fetchDocument } from '../zorgned/zorgned-service';

export async function fetchZorgnedJZDDocument(
  authProfileAndToken: AuthProfileAndToken,
  documentId: string
) {
  const response = fetchDocument(
    authProfileAndToken,
    'ZORGNED_JZD',
    documentId
  );
  return response;
}
