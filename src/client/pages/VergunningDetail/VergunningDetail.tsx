import React, { useContext } from 'react';
import useRouter from 'use-react-router';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import { AppContext } from '../../AppState';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  LoadingContent,
  PageContent,
  PageHeading,
} from '../../components';
import styles from './VergunningDetail.module.scss';
import { defaultDateFormat } from '../../../universal/helpers/date';
import InfoDetail, {
  InfoDetailGroup,
} from '../../components/InfoDetail/InfoDetail';

export default () => {
  const { VERGUNNINGEN } = useContext(AppContext);

  const {
    match: {
      params: { id },
    },
  } = useRouter();

  const VergunningItem = VERGUNNINGEN.content?.find(item => item.id === id);
  const noContent = !isLoading(VERGUNNINGEN) && !VergunningItem;

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
              VergunningItem?.dateValidStart
                ? defaultDateFormat(VergunningItem.dateValidStart)
                : '-'
            }
          />
          <InfoDetail
            label="Tot en met"
            value={
              VergunningItem?.dateValidEnd
                ? defaultDateFormat(VergunningItem.dateValidEnd)
                : '-'
            }
          />
        </InfoDetailGroup>
      </PageContent>
    </DetailPage>
  );
};
