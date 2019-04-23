import React, { useContext } from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import styles from './InkomenDetail.module.scss';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';
import { Chapters } from 'App.constants';
import { AppRoutes } from 'App.constants';
import { AppContext } from 'AppState';
import useReactRouter from 'use-react-router';
import DocumentList from 'components/DocumentList/DocumentList';
import Heading from 'components/Heading/Heading';
import PageContentMainHeadingBackLink from 'components/PageContentMainHeadingBackLink/PageContentMainHeadingBackLink';
import StatusLine from 'components/StatusLine/StatusLine';

export default () => {
  const {
    FOCUS: {
      data: { items },
    },
  } = useContext(AppContext);
  const {
    match: {
      params: { id },
    },
  } = useReactRouter();
  const FocusItem = items.find(item => item.id === id);
  return (
    <PageContentMain variant="full" className={styles.InkomenDetail}>
      <PageContentMainHeading el="div" variant="boxedWithIcon">
        <ChapterHeadingIcon chapter={Chapters.INKOMEN} />
        <PageContentMainHeadingBackLink to={AppRoutes.INKOMEN}>
          Inkomen
        </PageContentMainHeadingBackLink>
        <Heading el="h2" className={styles.PageHeading}>
          {FocusItem && FocusItem.title}
        </Heading>
      </PageContentMainHeading>
      {FocusItem && (
        <PageContentMainBody>
          <StatusLine items={FocusItem.process} />
        </PageContentMainBody>
      )}
    </PageContentMain>
  );
};
