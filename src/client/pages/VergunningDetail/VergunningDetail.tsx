import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Vergunning,
  VergunningDocument,
} from '../../../server/services/vergunningen';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  defaultDateFormat,
  directApiUrlByProfileType,
  isError,
  isLoading,
} from '../../../universal/helpers';
import {
  apiPristineResult,
  ApiResponse,
  apiSuccesResult,
} from '../../../universal/helpers/api';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  DocumentList,
  LoadingContent,
  PageContent,
  PageHeading,
} from '../../components';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';
import StatusLine, {
  StatusLineItem,
} from '../../components/StatusLine/StatusLine';
import { requestApiData, useDataApi } from '../../hooks/api/useDataApi';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import styles from './VergunningDetail.module.scss';

function useVergunningStatusLineItems(VergunningItem?: Vergunning) {
  const statusLineItems: StatusLineItem[] = useMemo(() => {
    if (!VergunningItem) {
      return [];
    }

    const isDone = VergunningItem.status === 'Afgehandeld';
    return [
      {
        id: 'item-1',
        status: 'Ontvangen',
        datePublished: VergunningItem.dateRequest,
        description: '',
        documents: [],
        isActive: false,
        isChecked: true,
        isHighlight: false,
      },
      {
        id: 'item-2',
        status: 'In behandeling',
        datePublished: VergunningItem.dateRequest,
        description: '',
        documents: [],
        isActive: !isDone,
        isChecked: true,
        isHighlight: !isDone,
      },
      {
        id: 'item-3',
        status: 'Afgehandeld',
        datePublished: VergunningItem.dateDecision || '',
        description: '',
        documents: [],
        isActive: isDone,
        isChecked: isDone,
        isHighlight: isDone,
      },
    ];
  }, [VergunningItem]);

  return statusLineItems;
}

export default () => {
  const { VERGUNNINGEN } = useAppStateGetter();
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
      transformResponse: [
        ...requestApiData.defaults.transformResponse,
        ({ content }) => {
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
      ],
    },
    apiPristineResult([])
  );
  const { id } = useParams<{ id: string }>();
  const profileType = useProfileTypeValue();
  const VergunningItem = VERGUNNINGEN.content?.find(item => item.id === id);
  const noContent = !isLoading(VERGUNNINGEN) && !VergunningItem;
  const statusLineItems = useVergunningStatusLineItems(VergunningItem);
  const documentsUrl = VergunningItem?.documentsUrl
    ? directApiUrlByProfileType(VergunningItem?.documentsUrl, profileType)
    : false;

  // Fetch the documents for this Item
  useEffect(() => {
    if (documentsUrl) {
      fetchDocuments({
        url: documentsUrl,
      });
    }
  }, [documentsUrl, fetchDocuments]);

  return (
    <DetailPage>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{
          to: AppRoutes.VERGUNNINGEN,
          title: ChapterTitles.VERGUNNINGEN,
        }}
        isLoading={isLoading(VERGUNNINGEN)}
      >
        {VergunningItem?.caseType || 'Vergunning'}
      </PageHeading>

      <PageContent className={styles.DetailPageContent}>
        {(isError(VERGUNNINGEN) || noContent) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
        {isLoading(VERGUNNINGEN) && (
          <LoadingContent className={styles.LoadingContentInfo} />
        )}
        {!isLoading(VERGUNNINGEN) && (
          <>
            <InfoDetail
              label="Kenmerk"
              value={VergunningItem?.identifier || '-'}
            />
            <InfoDetail
              label="Soort vergunning"
              value={VergunningItem?.caseType || '-'}
            />
            <InfoDetail
              label="Omschrijving"
              value={VergunningItem?.title || '-'}
            />
            <InfoDetail
              label="Locatie"
              value={VergunningItem?.location || '-'}
            />
            <InfoDetailGroup>
              <InfoDetail
                label="Vanaf"
                value={
                  (VergunningItem?.dateFrom
                    ? defaultDateFormat(VergunningItem.dateFrom)
                    : '-') +
                  (VergunningItem?.timeStart
                    ? ' - ' + VergunningItem.timeStart
                    : '')
                }
              />
              <InfoDetail
                label="Tot en met"
                value={
                  (VergunningItem?.dateEnd
                    ? defaultDateFormat(VergunningItem.dateEnd)
                    : '-') +
                  (VergunningItem?.timeEnd
                    ? ' - ' + VergunningItem.timeEnd
                    : '')
                }
              />
            </InfoDetailGroup>
            {!!VergunningItem?.decision && (
              <InfoDetail label="Resultaat" value={VergunningItem.decision} />
            )}

            <InfoDetail
              el="div"
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
          </>
        )}
      </PageContent>
      {!!statusLineItems.length && (
        <StatusLine
          className={styles.VergunningStatus}
          trackCategory={`Vergunningen detail / status`}
          items={statusLineItems}
          showToggleMore={false}
          id={`vergunning-detail-${id}`}
        />
      )}
    </DetailPage>
  );
};
