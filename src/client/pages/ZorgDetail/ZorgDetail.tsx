import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  InfoDetail,
  LinkdInline,
  LoadingContent,
  PageContent,
  PageHeading,
  StatusLine,
} from '../../components';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './ZorgDetail.module.scss';

export default function ZorgDetail() {
  const { WMO } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();

  const WmoItem = WMO.content?.find((item) => item.id === id);
  const noContent = !isLoading(WMO) && !WmoItem;

  const steps = useMemo(() => {
    if (!WmoItem) {
      return [];
    }
    return WmoItem.steps.map((step, index) => {
      if (index === 0 && !step.documents.length) {
        return Object.assign({}, step, {
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
            <p>
              We kunnen op dit moment geen gegevens tonen.{' '}
              <LinkdInline href={AppRoutes.ZORG}>
                Naar het overzicht
              </LinkdInline>
            </p>
          </Alert>
        )}
        {isLoading(WMO) && (
          <LoadingContent className={styles.LoadingContentInfo} />
        )}
        {!!WmoItem?.supplier && (
          <InfoDetail label="Aanbieder" value={WmoItem.supplier} />
        )}
      </PageContent>

      {!!WmoItem && (
        <StatusLine
          items={steps}
          trackCategory="Zorg en ondersteuning / Voorziening"
          id={id}
        />
      )}
    </DetailPage>
  );
}
