import { AppRoutes, Chapters } from 'App.constants';
import { AppContext } from 'AppState';
import Alert from 'components/Alert/Alert';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';
import Heading from 'components/Heading/Heading';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainHeadingBackLink from 'components/PageContentMainHeadingBackLink/PageContentMainHeadingBackLink';
import StatusLine from 'components/StatusLine/StatusLine';
import React, { useContext, useEffect } from 'react';
import useReactRouter from 'use-react-router';

import styles from './BurgerzakenDetail.module.scss';
import LoadingContent from 'components/LoadingContent/LoadingContent';

export default () => {
  const {
    FOCUS: {
      data: { items },
      isError,
      isLoading,
    },
  } = useContext(AppContext);
  const {
    match: {
      params: { id },
    },
  } = useReactRouter();
  const FocusItem = items.find(item => item.id === id);
  return (
    <PageContentMain variant="full" className={styles.BurgerzakenDetail}>
      <PageContentMainHeading el="div" variant="boxedWithIcon">
        <ChapterHeadingIcon chapter={Chapters.BURGERZAKEN} />
        <PageContentMainHeadingBackLink to={AppRoutes.BURGERZAKEN}>
          Burgerzaken
        </PageContentMainHeadingBackLink>
        <Heading el="h2" className={styles.PageHeading}>
          {!isLoading && FocusItem ? (
            FocusItem.title
          ) : (
            <LoadingContent
              className={styles.LoadingContentHeading}
              barConfig={[['50%', '3rem', '0']]}
            />
          )}
        </Heading>
      </PageContentMainHeading>
      {isLoading && (
        <LoadingContent className={styles.LoadingContentStatusLine} />
      )}
      {isError && (
        <Alert type="warning">
          Uw gegevens kunnen op dit moment niet worden getoond.
        </Alert>
      )}
      {FocusItem && (
        <PageContentMainBody>
          <StatusLine items={FocusItem.process} />
        </PageContentMainBody>
      )}
    </PageContentMain>
  );
};
