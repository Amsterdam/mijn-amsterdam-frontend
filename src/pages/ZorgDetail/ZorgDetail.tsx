import React, { useContext } from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import styles from './ZorgDetail.module.scss';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';
import { Chapters } from 'App.constants';
import { AppContext } from 'AppState';
import useReactRouter from 'use-react-router';
import Heading from 'components/Heading/Heading';
import PageContentMainHeadingBackLink from 'components/PageContentMainHeadingBackLink/PageContentMainHeadingBackLink';
import { AppRoutes } from '../../App.constants';

export default () => {
  const {
    WMO: {
      data: { items },
    },
  } = useContext(AppContext);
  const {
    match: {
      params: { id },
    },
  } = useReactRouter();
  const WmoItem = items.find(item => item.id === id);

  return (
    <PageContentMain variant="full" className={styles.ZorgDetail}>
      <PageContentMainHeading el="div" variant="boxedWithIcon">
        <ChapterHeadingIcon chapter={Chapters.ZORG} />
        <PageContentMainHeadingBackLink to={AppRoutes.ZORG}>
          Zorg
        </PageContentMainHeadingBackLink>
        <Heading el="h2" className={styles.PageHeading}>
          {WmoItem && WmoItem.title}
        </Heading>
      </PageContentMainHeading>
    </PageContentMain>
  );
};
