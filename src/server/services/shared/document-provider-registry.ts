import type { DocumentDownloadResponse } from './document-download-route-handler.ts';
import type { ApiResponse } from '../../../universal/helpers/api.ts';
import type { GenericDocument } from '../../../universal/types/App.types.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { ensureOpsFlagExists } from '../../config/azure-appconfiguration.ts';
import { encryptPayloadAndSessionID } from '../../helpers/encrypt-decrypt.ts';
import { BffEndpoints } from '../../routing/bff-routes.ts';
import { generateFullApiUrlBFF } from '../../routing/route-helpers.ts';

export type DocumentsListPayload = {
  domainService: string;
  source: string;
  zaakKey: string;
};

export type DocumentsDownloadPayload = {
  domainService: string;
  source: string;
  documentKey: string;
};

export type DocumentsUrlHelpers = {
  createListUrl: (sessionID: SessionID, zaakKey: string) => string;
  createDownloadUrl: (sessionID: SessionID, documentKey: string) => string;
};

export type DocumentsProviderRegistration = {
  domainService: string;
  source?: string;
  listDocuments: (
    authProfileAndToken: AuthProfileAndToken,
    payload: DocumentsListPayload,
    helpers: DocumentsUrlHelpers
  ) => Promise<ApiResponse<GenericDocument[]>>;
  downloadDocument: (
    authProfileAndToken: AuthProfileAndToken,
    payload: DocumentsDownloadPayload
  ) => Promise<DocumentDownloadResponse>;
};

export type DocumentsProvider = {
  domainService: string;
  source?: string;
  opsToggleKey: string;
  listDocuments: (
    authProfileAndToken: AuthProfileAndToken,
    payload: DocumentsListPayload
  ) => Promise<ApiResponse<GenericDocument[]>>;
  downloadDocument: (
    authProfileAndToken: AuthProfileAndToken,
    payload: DocumentsDownloadPayload
  ) => Promise<DocumentDownloadResponse>;
};

const providers = new Map<string, DocumentsProvider>();

function providerKey(domainService: string, source?: string) {
  return [domainService, source].join(':');
}

function createDocumentsUrlHelpers(
  domainService: string,
  source?: string
): DocumentsUrlHelpers {
  return {
    createListUrl(sessionID: SessionID, zaakKey: string) {
      const encryptedPayload = encryptPayloadAndSessionID(sessionID, {
        domainService,
        source,
        zaakKey,
      });

      return generateFullApiUrlBFF(BffEndpoints.SHARED_DOCUMENTS_LIST, [
        { id: encryptedPayload },
      ]);
    },
    createDownloadUrl(sessionID: SessionID, documentKey: string) {
      const encryptedPayload = encryptPayloadAndSessionID(sessionID, {
        domainService,
        source,
        documentKey,
      });

      return generateFullApiUrlBFF(BffEndpoints.SHARED_DOCUMENTS_DOWNLOAD, [
        { id: encryptedPayload },
      ]);
    },
  };
}

export function registerWithDocumentsProvider(
  registration: DocumentsProviderRegistration
) {
  const helpers = createDocumentsUrlHelpers(
    registration.domainService,
    registration.source
  );

  const provider: DocumentsProvider = {
    domainService: registration.domainService,
    source: registration.source,
    opsToggleKey:
      [registration.domainService, registration.source]
        .filter(Boolean)
        .join('.')
        .toUpperCase() + '.documents',
    listDocuments: (authProfileAndToken, payload) => {
      return registration.listDocuments(authProfileAndToken, payload, helpers);
    },
    downloadDocument: registration.downloadDocument,
  };

  ensureOpsFlagExists(provider.opsToggleKey);

  providers.set(providerKey(provider.domainService, provider.source), provider);

  return helpers;
}

export function resetDocumentsProvidersForTesting() {
  providers.clear();
}

export function getDocumentsProvider(
  domainService: string,
  source: string
): DocumentsProvider | undefined {
  return providers.get(providerKey(domainService, source));
}

export const forTesting = {
  providerKey,
  createDocumentsUrlHelpers,
};
