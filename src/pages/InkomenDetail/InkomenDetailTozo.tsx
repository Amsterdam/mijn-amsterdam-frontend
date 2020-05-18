import React, { useContext } from 'react';
import { PageContent } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import { AppRoutes } from 'config/Routing.constants';
import { ChapterTitles } from 'config/Chapter.constants';
import { AppContext } from 'AppState';
import StatusLine from 'components/StatusLine/StatusLine';
import Alert from 'components/Alert/Alert';
import LoadingContent from 'components/LoadingContent/LoadingContent';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import { DetailPage } from 'components/Page/Page';
import { altDocumentContent } from 'data-formatting/focus';
import styles from './InkomenDetail.module.scss';
import Linkd from '../../components/Button/Button';
import { ExternalUrls } from '../../config/App.constants';
import useRouter from 'use-react-router';

export default () => {
  const {
    FOCUS_TOZO: { data: tozoItems, isError, isLoading },
  } = useContext(AppContext);

  const {
    match: {
      params: { id },
    },
  } = useRouter();

  const TozoItem = tozoItems?.length
    ? tozoItems.find(item => item.id === id)
    : null;
  const noContent = !isLoading && !TozoItem;

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
          voor beide onderstaand een apart besluit. Informatie die u hier ziet
          is een werkdag vertraagd.
        </p>
        <p>
          <Linkd external={true} href={ExternalUrls.WPI_TOZO}>
            Informatie over Tijdelijke overbruggingsregeling zelfstandig
            ondernemers (Tozo)
          </Linkd>
        </p>
        {(isError || noContent) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
        {isLoading && <LoadingContent />}
      </PageContent>
      {!!TozoItem?.process.aanvraag && (
        <StatusLine
          className={styles.AanvraagStatusLine}
          trackCategory={`Inkomen en Stadspas / Tozo aanvraag`}
          statusLabel="Tozo-aanvraag"
          items={TozoItem.process.aanvraag}
          showToggleMore={false}
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
          altDocumentContent={altDocumentContent}
          id={'inkomen-stadspas-detail-tozo-uitkering'}
        />
      )}
      {!!TozoItem?.process.lening.length && (
        <StatusLine
          trackCategory={`Inkomen en Stadspas / Tozo lening bedrijfskrediet`}
          statusLabel="Tozo-lening"
          items={TozoItem.process.lening}
          showToggleMore={false}
          altDocumentContent={altDocumentContent}
          id={'inkomen-stadspas-detail-tozo-lening'}
        />
      )}
    </DetailPage>
  );
};
