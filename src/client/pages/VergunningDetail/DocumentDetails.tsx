import { useEffect } from 'react';
import {
  Vergunning,
  VergunningDocument,
} from '../../../server/services/vergunningen';
import {
  apiPristineResult,
  ApiResponse,
  apiSuccesResult,
  directApiUrlByProfileType,
} from '../../../universal/helpers';
import DocumentList from '../../components/DocumentList/DocumentList';
import InfoDetail from '../../components/InfoDetail/InfoDetail';
import LoadingContent from '../../components/LoadingContent/LoadingContent';
import { useDataApi } from '../../hooks/api/useDataApi';
import { useProfileTypeValue } from '../../hooks/useProfileType';

export function DocumentDetails({ vergunning }: { vergunning: Vergunning }) {
  const profileType = useProfileTypeValue();
  const documentsUrl = vergunning?.documentsUrl
    ? directApiUrlByProfileType(vergunning?.documentsUrl, profileType)
    : false;

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
        return apiSuccesResult(
          content.map((document: VergunningDocument) =>
            // Some documents don't have titles, assign a default title.
            Object.assign(document, { title: document.title || 'Document' })
          )
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

  return (
    <InfoDetail
      valueWrapperElement="div"
      label="Documenten"
      value={
        isLoadingDocuments ? (
          <LoadingContent
            barConfig={[
              ['100%', '2rem', '1rem'],
              ['100%', '2rem', '1rem'],
            ]}
          />
        ) : !!documents?.length ? (
          <DocumentList documents={documents} isExpandedView={true} />
        ) : (
          <span>Geen documenten beschikbaar</span>
        )
      }
    />
  );
}
