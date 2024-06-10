import { useEffect } from 'react';
import type {
  Vergunning,
  VergunningDocument,
} from '../../../server/services/vergunningen/vergunningen';
import {
  apiPristineResult,
  ApiResponse,
  apiSuccessResult,
} from '../../../universal/helpers';
import { GenericDocument } from '../../../universal/types';
import DocumentList from '../../components/DocumentList/DocumentList';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';
import LoadingContent from '../../components/LoadingContent/LoadingContent';
import { useDataApi } from '../../hooks/api/useDataApi';

interface DocumentDetailsProps {
  vergunning: Vergunning;
  opaque?: boolean; // Does not show loading feedback and no InfoDetail to the user if 0 documents are retrieved.
  trackPath?: (document: GenericDocument) => string;
}

export function DocumentDetails({
  vergunning,
  opaque = true,
  trackPath,
}: DocumentDetailsProps) {
  const documentsUrl = vergunning?.documentsUrl;

  // Set-up the documents api source
  const [
    {
      data: { content: documents },
      isLoading: isLoadingDocuments,
    },
    fetchDocuments,
  ] = useDataApi<ApiResponse<VergunningDocument[]>>(
    {
      postpone: true,
      transformResponse: ({ content }) => {
        if (!content) {
          return [];
        }
        return apiSuccessResult(
          content.map((document: VergunningDocument) => {
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
      ) : !!documents?.length ? (
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
