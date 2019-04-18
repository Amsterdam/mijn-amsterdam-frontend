import React from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import styles from './ZorgDetail.module.scss';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';
import { Chapters } from 'App.constants';
import { IconButtonLink } from '../../components/ButtonLink/ButtonLink';
import { AppRoutes } from '../../App.constants';
import { ReactComponent as CaretLeft } from 'assets/icons/Chevron-Left.svg';

export default () => {
  return (
    <PageContentMain variant="full" className={styles.ZorgDetail}>
      <PageContentMainHeading el="header" variant="boxedWithIcon">
        <ChapterHeadingIcon chapter={Chapters.ZORG} />
        <IconButtonLink to={AppRoutes.ZORG}>
          <CaretLeft /> Terug
        </IconButtonLink>
        <h2 className={styles.PageHeading}>ZorgDetail</h2>
      </PageContentMainHeading>
      <PageContentMainBody variant="boxed">
        <p>ZorgDetail body</p>
      </PageContentMainBody>
    </PageContentMain>
  );
};
