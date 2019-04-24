import React, { useContext } from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import styles from './ZorgDetail.module.scss';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';
import { Chapters, AppRoutes } from 'App.constants';
import { AppContext } from 'AppState';
import useReactRouter from 'use-react-router';
import Heading from 'components/Heading/Heading';
import PageContentMainHeadingBackLink from 'components/PageContentMainHeadingBackLink/PageContentMainHeadingBackLink';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import { ButtonLinkExternal } from 'components/ButtonLink/ButtonLink';
import classnames from 'classnames';

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
      <PageContentMainBody variant="regularBoxed">
        <Heading className={styles.ListHeading}>Mijn gegevens</Heading>
        <ul className={styles.List}>
          {WmoItem && WmoItem.dateStart && (
            <li className={classnames(styles.ListItem, styles.DatesInfo)}>
              <p>
                <strong>Startdatum indicatie</strong>
                <time>{WmoItem.dateStart}</time>
              </p>
              {WmoItem && WmoItem.dateFinish && (
                <p>
                  <strong>Einddatum indicatie</strong>
                  <time>{WmoItem.dateFinish}</time>
                </p>
              )}
            </li>
          )}
          {WmoItem && WmoItem.supplier && (
            <li className={classnames(styles.ListItem, styles.SupplierInfo)}>
              <p>
                <strong>Leverancier</strong>
                <span>{WmoItem.supplier}</span>
              </p>
              <p>
                <strong>&nbsp;</strong>
                <ButtonLinkExternal to={WmoItem.supplierUrl}>
                  {WmoItem.supplierUrl}
                </ButtonLinkExternal>
              </p>
            </li>
          )}
        </ul>
      </PageContentMainBody>
    </PageContentMain>
  );
};
