import React, { useContext } from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
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
    <PageContentMain className={styles.ZorgDetail}>
      <PageContentMainHeading
        icon={<ChapterIcon chapter={Chapters.INKOMEN} />}
        backLink={{ to: AppRoutes.INKOMEN, title: ChapterTitles.INKOMEN }}
      >
        {WmoItem && WmoItem.title}
      </PageContentMainHeading>
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
    </PageContentMain>
  );
};
