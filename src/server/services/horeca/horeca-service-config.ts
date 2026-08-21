import {
  fetchDecosDocument,
  fetchDecosDocumentList,
} from '../decos/decos-service.ts';
import { registerWithDocumentsProvider } from '../shared/document-provider-registry.ts';

const horecaDocuments = registerWithDocumentsProvider({
  domainService: 'horeca',
  source: 'decos',
  async listDocuments(authProfileAndToken, payload, helpers) {
    return fetchDecosDocumentList(
      authProfileAndToken.profile.sid,
      payload.zaakKey,
      helpers.createDownloadUrl
    );
  },
  async downloadDocument(authProfileAndToken, payload) {
    return fetchDecosDocument(authProfileAndToken, payload.documentKey);
  },
});

export const createFetchDocumentsListUrl = horecaDocuments.createListUrl;
