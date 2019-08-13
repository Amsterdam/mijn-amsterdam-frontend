import React, { useContext, useEffect } from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import styles from './InkomenDetail.module.scss';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';
import { Chapters, AppRoutes, ChapterTitles } from 'App.constants';
import { AppContext } from 'AppState';
import useRouter from 'use-react-router';
import Heading from 'components/Heading/Heading';
import PageContentMainHeadingBackLink from 'components/PageContentMainHeadingBackLink/PageContentMainHeadingBackLink';
import StatusLine from 'components/StatusLine/StatusLine';
import Alert from 'components/Alert/Alert';
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
  } = useRouter();
  const FocusItem = items.find(item => item.id === id);
  return (
    <PageContentMain variant="full" className={styles.InkomenDetail}>
      <PageContentMainHeading el="div" variant="boxedWithIcon">
        <ChapterHeadingIcon chapter={Chapters.INKOMEN} />

        <Heading el="h2" className={styles.PageHeading}>
          <PageContentMainHeadingBackLink
            trackCategory="MA_Inkomen/Detail_Pagina"
            to={AppRoutes.INKOMEN}
          >
            {ChapterTitles.INKOMEN}
          </PageContentMainHeadingBackLink>
          {!isLoading && FocusItem ? (
            <span>{FocusItem.title}</span>
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
          <StatusLine
            items={FocusItem.process}
            trackCategory="MA_Inkomen/Detail_pagina/Metro_lijn"
          />
        </PageContentMainBody>
      )}
    </PageContentMain>
  );
};
