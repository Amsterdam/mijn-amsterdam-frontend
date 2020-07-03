import React, { useContext } from 'react';
import useRouter from 'use-react-router';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import { AppContext } from '../../AppState';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  Linkd,
  LoadingContent,
  PageContent,
  PageHeading,
  StatusLine,
  Heading,
} from '../../components';
import { ExternalUrls } from '../../config/app';
import styles from './InkomenDetail.module.scss';
import * as Sentry from '@sentry/browser';

export default () => {
  const { FOCUS_TOZO } = useContext(AppContext);

  const tozoItems = FOCUS_TOZO.content || [];
  const {
    match: {
      params: { id },
    },
  } = useRouter();

  let TozoItem = tozoItems.find(item => item.id === id);

  if (!TozoItem && tozoItems.length >= 1) {
    Sentry.captureMessage('Tozo Item not found', {
      extra: {
        requestedId: id,
        availableIds: tozoItems.map(item => item.id),
      },
    });
    TozoItem = tozoItems[tozoItems.length - 1];
  }

  const noContent = !isLoading(FOCUS_TOZO) && !TozoItem;

  let title = 'Tozo';

  if (TozoItem) {
    title = TozoItem.title;
  }

  const uitkeringSteps = TozoItem?.steps.filter(
    step => step.product === `${TozoItem?.productTitle}-uitkering`
  );
  const leningSteps = TozoItem?.steps.filter(
    step => step.product === `${TozoItem?.productTitle}-lening`
  );
  const aanvraagAndVoorschotSteps = TozoItem?.steps.filter(
    step =>
      step.product === `${TozoItem?.productTitle}-regeling` ||
      step.product === `${TozoItem?.productTitle}-voorschot`
  );

  return (
    <DetailPage className={styles.DetailPageTozo}>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{ to: AppRoutes.INKOMEN, title: ChapterTitles.INKOMEN }}
      >
        {isLoading(FOCUS_TOZO) ? (
          <LoadingContent barConfig={[['20rem', '3rem', '0']]} />
        ) : (
          TozoItem?.productTitle || title
        )}
      </PageHeading>
      <PageContent className={styles.DetailPageContent}>
        {TozoItem?.productTitle === 'Tozo 1' && (
          <div className={styles.Tozo2Alert}>
            <Heading size="tiny">
              Hebt u na 1 juni 2020 ook Tozo 2 aangevraagd?
            </Heading>
            <p>
              Wij werken er hard aan om ook die aanvraag in Mijn Amsterdam te
              tonen. Als het zover is, ziet u uw aanvraag vanzelf hier
              verschijnen.
            </p>
          </div>
        )}
        <p>
          Onderstaand ziet u de status van uw aanvraag voor een{' '}
          {TozoItem?.productTitle || 'Tozo'}-uitkering en/of een{' '}
          {TozoItem?.productTitle || 'Tozo'}
          -lening. Indien u beide heeft aangevraagd, ontvangt u voor beide een
          apart besluit. Informatie die u hier ziet is een werkdag vertraagd.
        </p>
        {!isLoading(FOCUS_TOZO) && (
          <p>
            {TozoItem?.productTitle === 'Tozo 1' ? (
              <Linkd external={true} href={ExternalUrls.WPI_TOZO}>
                Meer informatie over de {TozoItem?.title}
              </Linkd>
            ) : (
              <Linkd external={true} href={ExternalUrls.WPI_TOZO2}>
                Meer informatie over de {TozoItem?.title}
              </Linkd>
            )}
          </p>
        )}
        {(isError(FOCUS_TOZO) || noContent) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
        {isLoading(FOCUS_TOZO) && <LoadingContent />}
      </PageContent>
      {!!(aanvraagAndVoorschotSteps && aanvraagAndVoorschotSteps.length) && (
        <StatusLine
          className={styles.AanvraagStatusLine}
          trackCategory={`Inkomen en Stadspas / ${TozoItem?.productTitle} aanvraag`}
          statusLabel={`${TozoItem?.productTitle}-aanvraag`}
          items={aanvraagAndVoorschotSteps}
          showToggleMore={false}
          maxStepCount={-1}
          highlightKey={false}
          id={'inkomen-stadspas-detail-tozo-aanvraag'}
        />
      )}
      {!!(uitkeringSteps && uitkeringSteps.length) && (
        <StatusLine
          trackCategory={`Inkomen en Stadspas / ${TozoItem?.productTitle} uitkering levensonderhoud`}
          statusLabel={`${TozoItem?.productTitle}-uitkering`}
          items={uitkeringSteps}
          showToggleMore={false}
          maxStepCount={
            uitkeringSteps.length === 1 &&
            uitkeringSteps[0].status === 'Besluit'
              ? -1
              : 2
          }
          id={'inkomen-stadspas-detail-tozo-uitkering'}
        />
      )}
      {!!(leningSteps && leningSteps.length) && (
        <StatusLine
          trackCategory={`Inkomen en Stadspas / ${TozoItem?.productTitle} lening bedrijfskrediet`}
          statusLabel={`${TozoItem?.productTitle}-lening`}
          items={leningSteps}
          showToggleMore={false}
          maxStepCount={
            leningSteps.length === 1 && leningSteps[0].status === 'Besluit'
              ? -1
              : 2
          }
          id={'inkomen-stadspas-detail-tozo-lening'}
        />
      )}
    </DetailPage>
  );
};
