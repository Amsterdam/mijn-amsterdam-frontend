import { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { fetchDocument } from '../zorgned/zorgned-service.ts';

export async function fetchZorgnedJZDDocument(
  authProfileAndToken: AuthProfileAndToken,
  documentId: string
) {
  const response = fetchDocument(
    authProfileAndToken.profile.id,
    'ZORGNED_JZD',
    documentId
  );
  return response;
}
