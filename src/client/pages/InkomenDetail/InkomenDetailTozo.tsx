import React, { useContext } from 'react';
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
import { altDocumentContent } from './InkomenDetail';
import styles from './InkomenDetail.module.scss';
import { stepStatusLabels } from '../../../server/services/focus/focus-aanvragen-content';

export default () => {
  const { FOCUS_TOZO } = useContext(AppContext);

  const TozoItem = FOCUS_TOZO.content;
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
      {!!TozoItem?.process.aanvraag && (
        <StatusLine
          className={styles.AanvraagStatusLine}
          trackCategory={`Inkomen en Stadspas / Tozo aanvraag`}
          statusLabel="Status Tozo aanvraag"
          items={TozoItem.process.aanvraag}
          showToggleMore={false}
          maxStepCount={-1}
          altDocumentContent={altDocumentContent}
          id={'inkomen-stadspas-detail-tozo-aanvraag'}
        />
      )}
      {!!TozoItem?.process.uitkering.length && (
        <StatusLine
          trackCategory={`Inkomen en Stadspas / Tozo uitkering levensonderhoud`}
          statusLabel="Status Tozo uitkering levensonderhoud"
          items={TozoItem.process.uitkering}
          showToggleMore={false}
          maxStepCount={
            TozoItem.process.uitkering.length === 1 &&
            TozoItem.process.uitkering[0].status === stepStatusLabels.beslissing
              ? -1
              : 2
          }
          altDocumentContent={altDocumentContent}
          id={'inkomen-stadspas-detail-tozo-uitkering'}
        />
      )}
      {!!TozoItem?.process.lening.length && (
        <StatusLine
          trackCategory={`Inkomen en Stadspas / Tozo lening bedrijfskrediet`}
          statusLabel="Status Tozo lening bedrijfskrediet"
          items={TozoItem.process.lening}
          showToggleMore={false}
          maxStepCount={
            TozoItem.process.lening.length === 1 &&
            TozoItem.process.lening[0].status === stepStatusLabels.beslissing
              ? -1
              : 2
          }
          altDocumentContent={altDocumentContent}
          id={'inkomen-stadspas-detail-tozo-lening'}
        />
      )}
    </DetailPage>
  );
};
