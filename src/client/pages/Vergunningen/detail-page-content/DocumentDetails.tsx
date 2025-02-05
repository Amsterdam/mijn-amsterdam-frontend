import { useEffect } from 'react';

import { VergunningFrontendV2 } from '../../../../server/services/vergunningen/config-and-types';
import {
  ApiResponse_DEPRECATED,
  apiSuccessResult,
  apiPristineResult,
} from '../../../../universal/helpers/api';
import { GenericDocument } from '../../../../universal/types';
import { LoadingContent, DocumentList } from '../../../components';
import { InfoDetailGroup } from '../../../components/InfoDetail/InfoDetail';
import { useDataApi } from '../../../hooks/api/useDataApi';

interface DocumentDetailsProps {
  vergunning: VergunningFrontendV2;
  opaque?: boolean; // Does not show loading feedback and no InfoDetail to the user if 0 documents are retrieved.
  trackPath?: (document: GenericDocument) => string;
}

export function DocumentDetails({
  vergunning,
  opaque = true,
  trackPath,
}: DocumentDetailsProps) {
  const documentsUrl = vergunning?.fetchDocumentsUrl;

  // Set-up the documents api source
  const [
    {
      data: { content: documents },
      isLoading: isLoadingDocuments,
    },
    fetchDocuments,
  ] = useDataApi<ApiResponse_DEPRECATED<GenericDocument[]>>(
    {
      postpone: true,
      transformResponse: ({ content }) => {
        if (!content) {
          return [];
        }
        return apiSuccessResult(
          content.map((document: GenericDocument) => {
            // Some documents don't have titles, assign a default title.
            return Object.assign(document, {
              title: document.title || 'Document',
            });
          })
        );
      },
    },
    apiPristineResult([])
  );

  // Fetch the documents for this Item
  useEffect(() => {
    if (documentsUrl) {
      fetchDocuments({
        url: documentsUrl,
      });
    }
  }, [documentsUrl, fetchDocuments]);

  if (opaque && (!documents?.length || isLoadingDocuments)) {
    return null;
  }

  return (
    <InfoDetailGroup label="Documenten">
      {isLoadingDocuments ? (
        <LoadingContent
          barConfig={[
            ['100%', '2rem', '1rem'],
            ['100%', '2rem', '1rem'],
          ]}
        />
      ) : documents?.length ? (
        <DocumentList
          documents={documents}
          isExpandedView={true}
          trackPath={trackPath}
        />
      ) : (
        <span>Geen documenten beschikbaar</span>
      )}
    </InfoDetailGroup>
  );
}
