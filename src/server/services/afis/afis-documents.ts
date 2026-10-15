import { performance } from 'node:perf_hooks';

import { HttpStatusCode } from 'axios';

import { getAfisApiConfig, getFeedEntryProperties } from './afis-helpers.ts';
import type {
  AfisArcDocID,
  AfisDocumentDownloadSource,
  AfisDocumentIDSource,
  AfisFactuur,
} from './afis-types.ts';
import { apiErrorResult } from '../../../universal/helpers/api.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { requestData } from '../../helpers/source-api-request.ts';
import type {
  DocumentDownloadData,
  DocumentDownloadResponse,
} from '../shared/document-download-route-handler.ts';
import { DEFAULT_DOCUMENT_DOWNLOAD_MIME_TYPE } from '../shared/document-download-route-handler.ts';

export async function fetchAfisDocument(
  _authProfileAndToken: AuthProfileAndToken,
  factuurDocumentId: AfisFactuur['factuurDocumentId']
): Promise<DocumentDownloadResponse> {
  const documentIdRequestStartedAt = performance.now();
  const ArchiveDocumentIDResponse =
    await fetchAfisDocumentID(factuurDocumentId);
  // eslint-disable-next-line no-console -- Temporary diagnostics for large AFIS downloads.
  console.log(
    `[AFIS document download] Document ID lookup: ${(performance.now() - documentIdRequestStartedAt).toFixed(1)} ms`
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

  let attachmentRequestStartedAt = 0;
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
      // eslint-disable-next-line no-console -- Temporary diagnostics for large AFIS downloads.
      console.log(
        `[AFIS document download] Attachment source response received and parsed: ${(performance.now() - attachmentRequestStartedAt).toFixed(1)} ms`
      );

      if (typeof data?.Record?.attachment !== 'string') {
        throw new Error(
          'Afis document download - no valid response data provided'
        );
      }

      const simulationStartedAt = performance.now();
      const data2 = {
        Record: {
          attachment: Buffer.alloc(3000 * 1024 * 1024).toString('base64'),
          attachmentname: 'grote-factuur.pdf',
        },
      };
      // eslint-disable-next-line no-console -- Temporary diagnostics for large AFIS downloads.
      console.log(
        `[AFIS document download] Synthetic 100 MiB PDF encoded as base64: ${(performance.now() - simulationStartedAt).toFixed(1)} ms`
      );

      const decodingStartedAt = performance.now();
      const decodedDocument = Buffer.from(data2.Record.attachment, 'base64');
      // eslint-disable-next-line no-console -- Temporary diagnostics for large AFIS downloads.
      console.log(
        `[AFIS document download] Base64 decode (${(decodedDocument.length / 1024 / 1024).toFixed(1)} MiB): ${(performance.now() - decodingStartedAt).toFixed(1)} ms`
      );

      return {
        data: decodedDocument,
        mimetype: DEFAULT_DOCUMENT_DOWNLOAD_MIME_TYPE,
        filename: data.Record.attachmentname ?? 'factuur.pdf',
      };
    },
  });

  attachmentRequestStartedAt = performance.now();
  const response = await requestData<DocumentDownloadData>(config);
  // eslint-disable-next-line no-console -- Temporary diagnostics for large AFIS downloads.
  console.log(
    `[AFIS document download] Attachment request and transformation total: ${(performance.now() - attachmentRequestStartedAt).toFixed(1)} ms`
  );
  return response;
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
