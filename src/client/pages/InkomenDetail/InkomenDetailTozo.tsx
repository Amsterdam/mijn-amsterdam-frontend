import React, { useContext } from 'react';
import useRouter from 'use-react-router';
import { stepStatusLabels } from '../../../server/services/focus/focus-aanvragen-content';
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

export default () => {
  const { FOCUS_TOZO } = useContext(AppContext);

  const tozoItems = FOCUS_TOZO.content || [];
  const {
    match: {
      params: { id },
    },
  } = useRouter();

  const TozoItem = tozoItems.find(item => item.id === id);
  const noContent = !isLoading(FOCUS_TOZO) && !TozoItem;

  let title = 'Onbekend item';

  if (TozoItem) {
    title = TozoItem.title;
  }

  return (
    <DetailPage className={styles.DetailPageTozo}>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{ to: AppRoutes.INKOMEN, title: ChapterTitles.INKOMEN }}
      >
        {title}
      </PageHeading>
      <PageContent className={styles.DetailPageContent}>
        <p>
          Onderstaand ziet u de status van uw aanvraag voor een Tozo-uitkering
          en/of een Tozo-lening. Indien u beide heeft aangevraagd, ontvangt u
          voor beide onderstaand een apart besluit.
        </p>
        <p>
          <Linkd external={true} href={ExternalUrls.WPI_TOZO}>
            Informatie over Tijdelijke overbruggingsregeling zelfstandig
            ondernemers (Tozo)
          </Linkd>
        </p>
        {(isError(FOCUS_TOZO) || noContent) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
        {isLoading(FOCUS_TOZO) && <LoadingContent />}
      </PageContent>
      {!!TozoItem?.steps.aanvraag && (
        <StatusLine
          className={styles.AanvraagStatusLine}
          trackCategory={`Inkomen en Stadspas / Tozo aanvraag`}
          statusLabel="Tozo-aanvraag"
          items={TozoItem.steps.aanvraag}
          showToggleMore={false}
          maxStepCount={-1}
          id={'inkomen-stadspas-detail-tozo-aanvraag'}
        />
      )}
      {!!TozoItem?.steps.uitkering.length && (
        <StatusLine
          trackCategory={`Inkomen en Stadspas / Tozo uitkering levensonderhoud`}
          statusLabel="Tozo-uitkering"
          items={TozoItem.steps.uitkering}
          showToggleMore={false}
          maxStepCount={
            TozoItem.steps.uitkering.length === 1 &&
            TozoItem.steps.uitkering[0].status === stepStatusLabels.beslissing
              ? -1
              : 2
          }
          id={'inkomen-stadspas-detail-tozo-uitkering'}
        />
      )}
      {!!TozoItem?.steps.lening.length && (
        <StatusLine
          trackCategory={`Inkomen en Stadspas / Tozo lening bedrijfskrediet`}
          statusLabel="Tozo-lening"
          items={TozoItem.steps.lening}
          showToggleMore={false}
          maxStepCount={
            TozoItem.steps.lening.length === 1 &&
            TozoItem.steps.lening[0].status === stepStatusLabels.beslissing
              ? -1
              : 2
          }
          id={'inkomen-stadspas-detail-tozo-lening'}
        />
      )}
    </DetailPage>
  );
};
