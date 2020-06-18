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

  let title = 'Onbekend item';

  if (TozoItem) {
    title = TozoItem.title;
  }

  const uitkeringSteps = TozoItem?.steps.filter(
    step => step.product === 'Tozo-uitkering'
  );
  const leningSteps = TozoItem?.steps.filter(
    step => step.product === 'Tozo-lening'
  );
  const aanvraagAndVoorschotSteps = TozoItem?.steps.filter(
    step =>
      step.product === 'Tozo-regeling' || step.product === 'Tozo-voorschot'
  );

  return (
    <DetailPage className={styles.DetailPageTozo}>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{ to: AppRoutes.INKOMEN, title: ChapterTitles.INKOMEN }}
      >
        Uw {title}
      </PageHeading>
      <PageContent className={styles.DetailPageContent}>
        <p>
          Onderstaand ziet u de status van uw aanvraag voor een Tozo-uitkering
          en/of een Tozo-lening. Indien u beide heeft aangevraagd, ontvangt u
          voor beide een apart besluit. Informatie die u hier ziet is een
          werkdag vertraagd.
        </p>
        <p>
          <Linkd external={true} href={ExternalUrls.WPI_TOZO}>
            Meer informatie over de Tozo
          </Linkd>
        </p>
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
          trackCategory={`Inkomen en Stadspas / Tozo aanvraag`}
          statusLabel="Tozo-aanvraag"
          items={aanvraagAndVoorschotSteps}
          showToggleMore={false}
          maxStepCount={-1}
          highlightKey={false}
          id={'inkomen-stadspas-detail-tozo-aanvraag'}
        />
      )}
      {!!(uitkeringSteps && uitkeringSteps.length) && (
        <StatusLine
          trackCategory={`Inkomen en Stadspas / Tozo uitkering levensonderhoud`}
          statusLabel="Tozo-uitkering"
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
          trackCategory={`Inkomen en Stadspas / Tozo lening bedrijfskrediet`}
          statusLabel="Tozo-lening"
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
