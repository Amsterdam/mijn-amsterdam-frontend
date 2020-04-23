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
import { isError, isLoading } from '../../../universal/helpers';

import { AppContext } from '../../AppState';
import styles from './ZorgDetail.module.scss';
import useRouter from 'use-react-router';

export default () => {
  const { WMO } = useContext(AppContext);

  const {
    match: {
      params: { id },
    },
  } = useRouter();

  const WmoItem = WMO.content?.items.find(item => item.id === id);
  const noContent = !isLoading(WMO) && !WmoItem;

  return (
    <DetailPage>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{ to: AppRoutes.ZORG, title: ChapterTitles.ZORG }}
        isLoading={isLoading(WMO)}
      >
        {WmoItem?.title}
      </PageHeading>

      <PageContent className={styles.DetailPageContent}>
        {(isError(WMO) || noContent) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
        {isLoading(WMO) && (
          <LoadingContent className={styles.LoadingContentInfo} />
        )}
        {!!WmoItem?.supplier && (
          <p className={styles.InfoDetail}>
            Aanbieder
            <strong>{WmoItem.supplier}</strong>
          </p>
        )}
      </PageContent>

      {!!WmoItem && (
        <StatusLine
          items={WmoItem?.process || []}
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
