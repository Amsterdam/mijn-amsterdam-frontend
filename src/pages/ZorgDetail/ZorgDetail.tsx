import React, { useContext } from 'react';
import { DetailPage, PageContent } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import styles from './ZorgDetail.module.scss';
import { Chapters, ChapterTitles, AppRoutes } from 'App.constants';
import { AppContext } from 'AppState';
import useRouter from 'use-react-router';
import Alert from 'components/Alert/Alert';
import LoadingContent from 'components/LoadingContent/LoadingContent';
import StatusLine from 'components/StatusLine/StatusLine';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';

export default () => {
  const {
    WMO: {
      data: { items },
      isError,
      isLoading,
    },
  } = useContext(AppContext);

  const {
    match: {
      params: { id },
    },
  } = useRouter();

  const WmoItem = items.find(item => item.id === id);
  const noContent = !isLoading && !WmoItem;

  return (
    <DetailPage>
      <PageHeading
        icon={<ChapterIcon chapter={Chapters.ZORG} />}
        backLink={{ to: AppRoutes.ZORG, title: ChapterTitles.ZORG }}
        isLoading={isLoading}
      >
        {WmoItem && WmoItem.title}
      </PageHeading>

      <PageContent>
        {(isError || noContent) && (
          <Alert type="warning">
            We kunnen op dit moment geen gegevens tonen.
          </Alert>
        )}
        {isLoading && <LoadingContent className={styles.LoadingContentInfo} />}
        {!!WmoItem && !!WmoItem.supplier && (
          <p className={styles.InfoDetail}>
            Aanbieder
            <strong>{WmoItem.supplier}</strong>
          </p>
        )}
      </PageContent>

      {!!WmoItem && (
        <StatusLine
          items={WmoItem.process}
          trackCategory="Zorg en ondersteuning / Voorziening"
          altDocumentContent={(statusLineItem, stepNumber) => {
            return stepNumber === 1 ? (
              <p>
                <strong>
                  {WmoItem.isActual
                    ? 'U krijgt dit besluit per post.'
                    : 'U hebt dit besluit per post ontvangen.'}
                </strong>
              </p>
            ) : (
              ''
            );
          }}
        />
      )}
    </DetailPage>
  );
};
