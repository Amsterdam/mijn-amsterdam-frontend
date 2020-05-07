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
import {
  altDocumentContent,
  MAX_STEP_COUNT_FOCUS_REUEST,
} from './InkomenDetail';
import styles from './InkomenDetail.module.scss';

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
            Ondersteuning voor zelfstandigen / zzp'ers vanwege corona
          </Linkd>
        </p>
        {(isError(FOCUS_TOZO) || noContent) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
        {isLoading(FOCUS_TOZO) && <LoadingContent />}
      </PageContent>
      {!!TozoItem?.process.aanvraag.length && (
        <StatusLine
          className={styles.AanvraagStatusLine}
          showToggleMore={false}
          trackCategory={`Inkomen en Stadspas / `}
          statusLabel="Status Tozo aanvraag"
          items={TozoItem.process.aanvraag}
          maxStepCount={-1}
          altDocumentContent={altDocumentContent}
          id={'inkomen-stadspas-detail-tozo-aanvraag'}
        />
      )}
      {!!TozoItem?.process.uitkering.length && (
        <StatusLine
          trackCategory={`Inkomen en Stadspas / `}
          showToggleMore={false}
          statusLabel="Status Tozo uitkering"
          items={TozoItem.process.uitkering}
          maxStepCount={
            TozoItem.status.uitkering !== 'beslissing'
              ? MAX_STEP_COUNT_FOCUS_REUEST
              : undefined
          }
          altDocumentContent={altDocumentContent}
          id={'inkomen-stadspas-detail-tozo-uitkering'}
        />
      )}
      {!!TozoItem?.process.lening.length && (
        <StatusLine
          trackCategory={`Inkomen en Stadspas / `}
          showToggleMore={false}
          statusLabel="Status Tozo lening"
          items={TozoItem.process.lening}
          maxStepCount={
            TozoItem.status.lening !== 'beslissing'
              ? MAX_STEP_COUNT_FOCUS_REUEST
              : undefined
          }
          altDocumentContent={altDocumentContent}
          id={'inkomen-stadspas-detail-tozo-lening'}
        />
      )}
    </DetailPage>
  );
};
