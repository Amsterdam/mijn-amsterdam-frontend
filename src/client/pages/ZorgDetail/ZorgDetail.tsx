import {
  Alert,
  ChapterIcon,
  DetailPage,
  LoadingContent,
  PageContent,
  PageHeading,
  StatusLine,
} from '../../components';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import React, { useContext } from 'react';

import { AppContext } from '../../AppState';
import styles from './ZorgDetail.module.scss';
import useRouter from 'use-react-router';

export default () => {
  const {
    WMO: { data: items, isError, isLoading },
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
        icon={<ChapterIcon />}
        backLink={{ to: AppRoutes.ZORG, title: ChapterTitles.ZORG }}
        isLoading={isLoading}
      >
        {WmoItem && WmoItem.title}
      </PageHeading>

      <PageContent className={styles.DetailPageContent}>
        {(isError || noContent) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
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
          id={id}
          altDocumentContent={(statusLineItem, stepNumber) => {
            return !statusLineItem.documents.length && stepNumber === 1 ? (
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
