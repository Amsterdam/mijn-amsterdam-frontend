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
  const noContent = !isLoading && !FocusItem;

  return (
    <PageContentMain variant="full" className={styles.InkomenDetail}>
      <PageContentMainHeading el="div" variant="boxedWithIcon">
        <ChapterHeadingIcon chapter={Chapters.INKOMEN} />

        <Heading el="h2" size="large" className={styles.PageHeading}>
          <PageContentMainHeadingBackLink to={AppRoutes.INKOMEN}>
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
      <PageContentMainBody>
        {isLoading && (
          <LoadingContent className={styles.LoadingContentStatusLine} />
        )}
        {(isError || noContent) && (
          <Alert type="warning">
            We kunnen op dit moment geen gegevens tonen.
          </Alert>
        )}
        {!!FocusItem && (
          <StatusLine
            trackCategory={`Werk en inkomen / ${FocusItem.productTitle}`}
            items={FocusItem.process}
          />
        )}
      </PageContentMainBody>
    </PageContentMain>
  );
};
