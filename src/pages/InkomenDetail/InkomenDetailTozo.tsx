import React, { useContext } from 'react';
import { PageContent } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import { AppRoutes } from 'config/Routing.constants';
import { ChapterTitles } from 'config/Chapter.constants';
import { AppContext } from 'AppState';
import useRouter from 'use-react-router';
import StatusLine from 'components/StatusLine/StatusLine';
import Alert from 'components/Alert/Alert';
import LoadingContent from 'components/LoadingContent/LoadingContent';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import { DetailPage } from 'components/Page/Page';
import { altDocumentContent } from 'data-formatting/focus';
import styles from './InkomenDetail.module.scss';
import { matchPath } from 'react-router-dom';
import Linkd from '../../components/Button/Button';
import { ExternalUrls } from '../../config/App.constants';

export default () => {
  const {
    FOCUS_TOZO: { data: TozoItem, isError, isLoading },
  } = useContext(AppContext);

  const {
    location: { pathname },
    match: {
      params: { id },
    },
  } = useRouter();

  const isTozoRoute = matchPath(pathname, {
    path: AppRoutes['INKOMEN/TOZO'],
    exact: true,
    strict: false,
  });

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
          voor beide onderstaand een apart besluit.
        </p>
        {isTozoRoute && (
          <p>
            <Linkd external={true} href={ExternalUrls.WPI_TOZO}>
              Ondersteuning voor zelfstandigen / zzp'ers vanwege corona
            </Linkd>
          </p>
        )}
        {(isError || noContent) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
        {isLoading && <LoadingContent />}
      </PageContent>
      <StatusLine
        className={styles.AanvraagStatusLine}
        trackCategory={`Inkomen en Stadspas / `}
        statusLabel="Status Tozo aanvraag"
        items={TozoItem.process.aanvraag}
        altDocumentContent={altDocumentContent}
        id={'inkomen-stadspas-detail-tozo-aanvraag'}
      />
      {!!TozoItem.process.uitkering.length && (
        <StatusLine
          trackCategory={`Inkomen en Stadspas / `}
          statusLabel="Status Tozo uitkering"
          items={TozoItem.process.uitkering}
          altDocumentContent={altDocumentContent}
          id={'inkomen-stadspas-detail-tozo-uitkering'}
        />
      )}
      {!!TozoItem.process.lening.length && (
        <StatusLine
          trackCategory={`Inkomen en Stadspas / `}
          statusLabel="Status Tozo lening"
          items={TozoItem.process.lening}
          altDocumentContent={altDocumentContent}
          id={'inkomen-stadspas-detail-tozo-lening'}
        />
      )}
    </DetailPage>
  );
};
