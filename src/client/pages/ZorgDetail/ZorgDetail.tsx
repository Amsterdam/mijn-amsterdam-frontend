import React, { useContext, useMemo } from 'react';
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
  StatusLine,
  InfoDetail,
} from '../../components';
import styles from './ZorgDetail.module.scss';

export default () => {
  const { WMO } = useContext(AppContext);

  const {
    match: {
      params: { id },
    },
  } = useRouter();

  const WmoItem = WMO.content?.items.find(item => item.id === id);
  const noContent = !isLoading(WMO) && !WmoItem;

  const steps = useMemo(() => {
    if (!WmoItem) {
      return [];
    }
    return WmoItem.process.map((step, index) => {
      if (index === 0 && !step.documents.length) {
        return Object.assign(step, {
          altDocumentContent: (
            <p>
              <strong>
                {WmoItem.isActual
                  ? 'U krijgt dit besluit per post.'
                  : 'U hebt dit besluit per post ontvangen.'}
              </strong>
            </p>
          ),
        });
      }
      return step;
    });
  }, [WmoItem]);

  return (
    <DetailPage>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{ to: AppRoutes.ZORG, title: ChapterTitles.ZORG }}
        isLoading={isLoading(WMO)}
      >
        {WmoItem?.title || 'Zorg detailpagina'}
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
          <InfoDetail label="Aanbieder" value={WmoItem.supplier} />
        )}
      </PageContent>

      <StatusLine
        items={steps}
        trackCategory="Zorg en ondersteuning / Voorziening"
        id={id}
      />
    </DetailPage>
  );
};
