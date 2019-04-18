import React, { useContext } from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import styles from './ZorgDetail.module.scss';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';
import { Chapters } from 'App.constants';
import { IconButtonLink } from 'components/ButtonLink/ButtonLink';
import { AppRoutes } from 'App.constants';
import { ReactComponent as CaretLeft } from 'assets/icons/Chevron-Left.svg';
import { AppContext } from 'AppState';
import useReactRouter from 'use-react-router';
import Heading from 'components/Heading/Heading';

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
      <PageContentMainHeading el="header" variant="boxedWithIcon">
        <ChapterHeadingIcon chapter={Chapters.ZORG} />
        <IconButtonLink to={AppRoutes.ZORG}>
          <CaretLeft /> Zorg
        </IconButtonLink>
        <Heading el="h2" className={styles.PageHeading}>
          {WmoItem && WmoItem.title}
        </Heading>
      </PageContentMainHeading>
    </PageContentMain>
  );
};
