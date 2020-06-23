import React, { useContext } from 'react';
import useRouter from 'use-react-router';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import { defaultDateFormat } from '../../../universal/helpers/date';
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

  const documents: GenericDocument[] = [
    {
      id: 'doc-1',
      url: 'http://example.org/bla',
      title: 'Document 1',
      type: 'PDF',
      datePublished: '2020-04-04',
    },
    {
      id: 'doc-2',
      url: 'http://example.org/bla',
      title: 'Document 2',
      type: 'PDF',
      datePublished: '2020-04-04',
    },
  ];

  const statusLineItems: StatusLineItem[] = [
    {
      id: 'item-1',
      status: 'Ontvangen',
      datePublished: '2020-04-16',
      description: '',
      documents: [],
      isActive: false,
      isChecked: true,
      isHighlight: false,
    },
    {
      id: 'item-2',
      status: 'In behandeling',
      datePublished: '2020-05-03',
      description: '',
      documents: [],
      isActive: true,
      isChecked: true,
      isHighlight: true,
    },
    {
      id: 'item-3',
      status: 'Afgehandeld',
      datePublished: '',
      description: '',
      documents: [],
      isActive: false,
      isChecked: false,
      isHighlight: false,
    },
  ];

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
        <InfoDetail
          label="Zaakkenmerk"
          value={VergunningItem?.identifier || '-'}
        />
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
        <InfoDetail
          label="Documenten"
          value={<DocumentList documents={documents} isExpandedView={true} />}
        />
      </PageContent>
      <StatusLine
        trackCategory={`Vergunningen detail / status`}
        items={statusLineItems}
        showToggleMore={false}
        id={`vergunning-detail-${id}`}
      />
    </DetailPage>
  );
};
