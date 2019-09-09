import React, { useContext } from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import styles from './ZorgDetail.module.scss';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';
import { Chapters, ChapterTitles, AppRoutes } from 'App.constants';
import { AppContext } from 'AppState';
import useRouter from 'use-react-router';
import Heading from 'components/Heading/Heading';
import PageContentMainHeadingBackLink from 'components/PageContentMainHeadingBackLink/PageContentMainHeadingBackLink';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import Alert from 'components/Alert/Alert';
import LoadingContent from 'components/LoadingContent/LoadingContent';
import StatusLine from 'components/StatusLine/StatusLine';

export default () => {
  const {
    WMO: {
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

  const WmoItem = items.find(item => item.id === id);
  const noContent = !isLoading && !WmoItem;

  return (
    <PageContentMain variant="full" className={styles.ZorgDetail}>
      <PageContentMainHeading el="div" variant="boxedWithIcon">
        <ChapterHeadingIcon chapter={Chapters.ZORG} />
        <Heading el="h2" size="large" className={styles.PageHeading}>
          <PageContentMainHeadingBackLink to={AppRoutes.ZORG}>
            {ChapterTitles.ZORG}
          </PageContentMainHeadingBackLink>
          {!isLoading && WmoItem ? (
            <span>{WmoItem.title}</span>
          ) : (
            <LoadingContent
              className={styles.LoadingContentHeading}
              barConfig={[['50%', '3rem', '0']]}
            />
          )}
        </Heading>
      </PageContentMainHeading>
      <PageContentMainBody variant="boxed">
        {(isError || noContent) && (
          <Alert type="warning">
            Uw gegevens kunnen op dit moment niet worden getoond.
          </Alert>
        )}
        {isLoading && <LoadingContent className={styles.LoadingContentInfo} />}
        {!!WmoItem && !!WmoItem.supplier && (
          <p className={styles.InfoDetail}>
            Leverancier
            <strong>{WmoItem.supplier}</strong>
          </p>
        )}
      </PageContentMainBody>
      {!!WmoItem && (
        <PageContentMainBody>
          <StatusLine
            items={WmoItem.process}
            trackCategory="Zorg en ondersteuning / Voorziening"
            altDocumentContent={(statusLineItem, stepNumber) => {
              return stepNumber === 1 ? (
                <p>
                  <strong>Deze informatie krijg je ook per post.</strong>
                </p>
              ) : (
                ''
              );
            }}
          />
        </PageContentMainBody>
      )}
    </PageContentMain>
  );
};
