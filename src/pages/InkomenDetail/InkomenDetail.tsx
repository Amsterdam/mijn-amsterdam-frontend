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
import { TOZO_PRODUCT_TITLE } from '../../data-formatting/focus';

export default () => {
  const {
    FOCUS: {
      data: { items },
      isError,
      isLoading,
    },
    FOCUS_COMBINED: {
      data: { tozodocumenten },
    },
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

  let FocusItem = null;
  let TozoDocumentItem = null;

  if (isTozoRoute) {
    if (id) {
      TozoDocumentItem = tozodocumenten.find(item => item.id === id);
    } else {
      // TODO: determine which item to show here
      FocusItem = items.find(item => item.productTitle === TOZO_PRODUCT_TITLE);
    }
  } else if (id) {
    FocusItem = items.find(item => item.id === id);
  }

  const noContent = !isLoading && !FocusItem && !TozoDocumentItem;

  let title = isTozoRoute ? TOZO_PRODUCT_TITLE : 'Onbekend item';

  if (FocusItem) {
    title = FocusItem.title;
  } else if (TozoDocumentItem) {
    title = TozoDocumentItem.title;
  }

  return (
    <DetailPage>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{ to: AppRoutes.INKOMEN, title: ChapterTitles.INKOMEN }}
      >
        {title}
      </PageHeading>
      <PageContent className={styles.DetailPageContent}>
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
      {!!FocusItem && !!FocusItem.process && (
        <StatusLine
          trackCategory={`Inkomen en Stadspas / ${FocusItem.productTitle}`}
          items={FocusItem.process}
          altDocumentContent={altDocumentContent}
          id={id}
        />
      )}
      {!!TozoDocumentItem && (
        <StatusLine
          trackCategory={`Inkomen en Stadspas / ${TozoDocumentItem.title}`}
          items={TozoDocumentItem.process}
          altDocumentContent={altDocumentContent}
          id={id}
        />
      )}
    </DetailPage>
  );
};
