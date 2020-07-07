import React, { useContext, useMemo } from 'react';
import useRouter from 'use-react-router';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  isError,
  isLoading,
  defaultDateFormat,
} from '../../../universal/helpers';
import { GenericDocument } from '../../../universal/types/App.types';
import { AppContext } from '../../AppState';
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
import styles from './VergunningDetail.module.scss';
import StatusLine, {
  StatusLineItem,
} from '../../components/StatusLine/StatusLine';

export default () => {
  const { VERGUNNINGEN } = useContext(AppContext);

  const {
    match: {
      params: { id },
    },
  } = useRouter();

  const VergunningItem = VERGUNNINGEN.content?.find(item => item.id === id);
  const noContent = !isLoading(VERGUNNINGEN) && !VergunningItem;
  const documents: GenericDocument[] = [];

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
        <InfoDetail label="Kenmerk" value={VergunningItem?.identifier || '-'} />
        <InfoDetail
          label="Soort vergunning"
          value={VergunningItem?.caseType || '-'}
        />
        <InfoDetail label="Omschrijving" value={VergunningItem?.title || '-'} />
        <InfoDetail label="Locatie" value={VergunningItem?.location || '-'} />
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
              (VergunningItem?.timeEnd ? ' - ' + VergunningItem.timeEnd : '')
            }
          />
        </InfoDetailGroup>
        {!!VergunningItem?.decision && (
          <InfoDetail label="Resultaat" value={VergunningItem.decision} />
        )}
        {!!documents.length && (
          <InfoDetail
            label="Documenten"
            value={<DocumentList documents={documents} isExpandedView={true} />}
          />
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
