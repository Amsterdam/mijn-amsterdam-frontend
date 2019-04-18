import React, { useContext } from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import styles from './ZorgDetail.module.scss';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';
import { Chapters } from 'App.constants';
import { IconButtonLink } from 'components/ButtonLink/ButtonLink';
import { AppRoutes } from 'App.constants';
import { ReactComponent as CaretLeft } from 'assets/icons/Chevron-Left.svg';
import { AppContext } from 'AppState';
import useReactRouter from 'use-react-router';
import { WmoItem } from '../../data-formatting/wmo';
import DocumentList from 'components/DocumentList/DocumentList';
import Heading from '../../components/Heading/Heading';

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
  const documents = [
    {
      id: 'doc-1',
      title: 'Documentje',
      type: 'beschikking',
      datePublished: '2019-10-12',
      url: 'http://www.download',
    },
    {
      id: 'doc-1',
      title: 'Documentje',
      type: 'beschikking',
      datePublished: '2019-10-12',
      url: 'http://www.download',
    },
    {
      id: 'doc-1',
      title: 'Documentje',
      type: 'beschikking',
      datePublished: '2019-10-12',
      url: 'http://www.download',
    },
    {
      id: 'doc-1',
      title: 'Documentje',
      type: 'beschikking',
      datePublished: '2019-10-12',
      url: 'http://www.download',
    },
  ];
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
      <PageContentMainBody variant="boxed">
        <Heading size="mediumLarge" className={styles.DocumentListHeading}>
          Mijn brieven
        </Heading>
        <DocumentList items={documents} />
      </PageContentMainBody>
    </PageContentMain>
  );
};
