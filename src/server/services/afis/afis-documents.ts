import { HttpStatusCode } from 'axios';

import { getAfisApiConfig, getFeedEntryProperties } from './afis-helpers';
import {
  AfisArcDocID,
  AfisDocumentDownloadSource,
  AfisDocumentIDSource,
  AfisFactuur,
} from './afis-types';
import { apiErrorResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { requestData } from '../../helpers/source-api-request';
import {
  DEFAULT_DOCUMENT_DOWNLOAD_MIME_TYPE,
  DocumentDownloadData,
  DocumentDownloadResponse,
} from '../shared/document-download-route-handler';

export async function fetchAfisDocument(
  _authProfileAndToken: AuthProfileAndToken,
  factuurDocumentId: AfisFactuur['factuurDocumentId']
): Promise<DocumentDownloadResponse> {
  const ArchiveDocumentIDResponse =
    await fetchAfisDocumentID(factuurDocumentId);
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
