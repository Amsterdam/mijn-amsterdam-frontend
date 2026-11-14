import { HttpStatusCode } from 'axios';

import { apiErrorResult } from '../../../universal/helpers/api.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { requestData } from '../../helpers/source-api-request.ts';
import type {
  DocumentDownloadData,
  DocumentDownloadResponse,
} from '../shared/document-download-route-handler.ts';
import { DEFAULT_DOCUMENT_DOWNLOAD_MIME_TYPE } from '../shared/document-download-route-handler.ts';
import { authorizeAfisAccount } from './afis.ts';
import { getAfisApiConfig, getFeedEntryProperties } from './afis-helpers.ts';
import type {
  AfisArcDocID,
  AfisDocumentDownloadSource,
  AfisDocumentIDSource,
  AfisFactuur,
} from './afis-types.ts';

export async function fetchAfisDocument(
  authProfileAndToken: AuthProfileAndToken,
  factuurDocumentId: AfisFactuur['factuurDocumentId']
): Promise<DocumentDownloadResponse> {
  const [businessPartnerId, documentId] = factuurDocumentId.split('|');
  if (authProfileAndToken.profile.profileType === 'commercial') {
    const authorization = await authorizeAfisAccount(
      authProfileAndToken,
      documentId ? businessPartnerId : null
    );
    if (authorization.status !== 'OK') {
      return authorization;
    }
  }
  const ArchiveDocumentIDResponse = await fetchAfisDocumentID(
    documentId ?? factuurDocumentId
  );
  if (ArchiveDocumentIDResponse.status !== 'OK') {
    return ArchiveDocumentIDResponse;
  }

  if (!ArchiveDocumentIDResponse.content) {
    return apiErrorResult(
      'ArcDocumentID not found',
      null,
      HttpStatusCode.NotFound
    );
  }

  const config = await getAfisApiConfig({
    formatUrl: ({ url }) => {
      return `${url}/getDebtorInvoice/API_CV_ATTACHMENT_SRV/`;
    },
    method: 'post',
    data: {
      Record: {
        ArchiveDocumentID: ArchiveDocumentIDResponse.content,
        BusinessObjectTypeName: 'BKPF',
      },
    },
    transformResponse: (
      data: AfisDocumentDownloadSource
    ): DocumentDownloadData => {
      if (typeof data?.Record?.attachment !== 'string') {
        throw new Error(
          'Afis document download - no valid response data provided'
        );
      }
      const decodedDocument = Buffer.from(data.Record.attachment, 'base64');
      return {
        data: decodedDocument,
        mimetype: DEFAULT_DOCUMENT_DOWNLOAD_MIME_TYPE,
        filename: data.Record.attachmentname ?? 'factuur.pdf',
      };
    },
  });

  return requestData<DocumentDownloadData>(config);
}

/** Retrieve an ArcDocID from the AFIS source API.
 *
 *  This ID uniquely identifies a document and can be used -
 *  to download one with our document downloading endpoint for example.
 *
 *  There can be more then one ArcDocID's pointing to the same document. We need the the most recent one.
 */
async function fetchAfisDocumentID(
  factuurDocumentId: AfisFactuur['factuurDocumentId']
) {
  const config = await getAfisApiConfig({
    formatUrl: ({ url }) => {
      return `${url}/API/ZFI_OPERACCTGDOCITEM_CDS/ZFI_CDS_TOA02?$filter=AccountNumber eq '${factuurDocumentId}'&$select=ArcDocId&$orderby=ArDate desc`;
    },
    transformResponse: (data: AfisDocumentIDSource) => {
      const entryProperties = getFeedEntryProperties(data);
      if (entryProperties.length) {
        return entryProperties[0].ArcDocId;
      }
      return null;
    },
  });

  return requestData<AfisArcDocID>(config);
}
