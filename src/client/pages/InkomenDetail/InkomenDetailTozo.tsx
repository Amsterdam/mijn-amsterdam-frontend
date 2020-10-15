import * as Sentry from '@sentry/browser';
import React from 'react';
import { useParams } from 'react-router-dom';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  Linkd,
  LoadingContent,
  PageContent,
  PageHeading,
  StatusLine,
} from '../../components';
import { LinkdInline } from '../../components/Button/Button';
import { ExternalUrls } from '../../config/app';
import { useAppStateGetter } from '../../hooks/useAppState';
import AlertDocumentDownloadsDisabled from '../Inkomen/AlertDocumentDownloadsDisabled';
import styles from './InkomenDetail.module.scss';

export default () => {
  const { FOCUS_TOZO } = useAppStateGetter();

  const tozoItems = FOCUS_TOZO.content || [];
  const { id } = useParams();

  let TozoItem = tozoItems.find(item => item.id === id);

  if (!isLoading(FOCUS_TOZO)) {
    if (!TozoItem) {
      Sentry.captureMessage('Tozo Item not found', {
        extra: {
          requestedId: id,
          availableIds: tozoItems.map(item => item.id),
        },
      });
      // TozoItem = tozoItems[tozoItems.length - 1];
    }
  }

  const noContent = !isLoading(FOCUS_TOZO) && !TozoItem;

  let title = 'Tozo';

  if (TozoItem) {
    title = TozoItem.title;
  }

  return (
    <DetailPage className={styles.DetailPageTozo}>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{ to: AppRoutes.INKOMEN, title: ChapterTitles.INKOMEN }}
        isLoading={isLoading(FOCUS_TOZO)}
      >
        {TozoItem?.productTitle || title}
      </PageHeading>
      <PageContent className={styles.DetailPageContent}>
        {!!TozoItem && (
          <>
            <p>
              Onderstaand ziet u de status van uw aanvraag voor een{' '}
              {TozoItem?.productTitle || 'Tozo'}-uitkering en/of een{' '}
              {TozoItem?.productTitle || 'Tozo'}
              -lening. Indien u beide heeft aangevraagd, ontvangt u voor beide
              een apart besluit. Informatie die u hier ziet is een werkdag
              vertraagd.
            </p>
            {!isLoading(FOCUS_TOZO) && (
              <p>
                <Linkd external={true} href={ExternalUrls.WPI_TOZO}>
                  Meer informatie over de {TozoItem?.title}
                </Linkd>
              </p>
            )}
          </>
        )}
        {isError(FOCUS_TOZO) ||
          (noContent && !tozoItems.length && (
            <Alert type="warning">
              <p>
                We kunnen op dit moment geen gegevens tonen.{' '}
                <LinkdInline href={AppRoutes.INKOMEN}>
                  Ga naar het overzicht
                </LinkdInline>
                .
              </p>
            </Alert>
          ))}
        {!isLoading(FOCUS_TOZO) && !TozoItem && !!tozoItems.length && (
          <Alert type="warning">
            <p>
              We kunnen op dit moment geen gegevens tonen. Deze pagina is
              mogelijk verplaatst. Kies hieronder een van de beschikbare Tozo
              aanvragen.
            </p>
            <ul className={styles.TozoAlternatives}>
              {tozoItems.map(tozoItem => {
                return <Linkd href={tozoItem.link.to}>{tozoItem.title}</Linkd>;
              })}
            </ul>
          </Alert>
        )}
        <AlertDocumentDownloadsDisabled />
        {isLoading(FOCUS_TOZO) && <LoadingContent />}
      </PageContent>
      {!!(TozoItem?.steps && TozoItem.steps.length) && (
        <StatusLine
          className={styles.AanvraagStatusLine}
          trackCategory={`Inkomen en Stadspas / ${TozoItem?.productTitle} aanvraag`}
          statusLabel={`${TozoItem?.productTitle}-aanvraag`}
          items={TozoItem.steps}
          showToggleMore={false}
          maxStepCount={-1}
          highlightKey={false}
          id={'inkomen-stadspas-detail-tozo-aanvraag'}
        />
      )}
    </DetailPage>
  );
};
