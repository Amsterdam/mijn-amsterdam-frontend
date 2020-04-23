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
import { StepType } from '../../components/StatusLine/StatusLine';
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
  const lineItemsTotal = WmoItem?.process.length || 0;
  const items =
    WmoItem?.process.map((item, index) => {
      const stepType: StepType =
        index === lineItemsTotal - 1
          ? 'last-step'
          : index === 0
          ? 'first-step'
          : 'intermediate-step';
      return Object.assign(item, { stepType });
    }) || [];

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
          items={items}
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
