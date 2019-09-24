import React, { useContext, useEffect } from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import styles from './InkomenDetail.module.scss';
import { Chapters, AppRoutes, ChapterTitles } from 'App.constants';
import { AppContext } from 'AppState';
import useRouter from 'use-react-router';
import StatusLine from 'components/StatusLine/StatusLine';
import Alert from 'components/Alert/Alert';
import LoadingContent from 'components/LoadingContent/LoadingContent';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';

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
    <PageContentMain className={styles.InkomenDetail}>
      <PageContentMainHeading
        icon={<ChapterIcon chapter={Chapters.INKOMEN} />}
        backLink={{ to: AppRoutes.INKOMEN, title: ChapterTitles.INKOMEN }}
      >
        {FocusItem && FocusItem.title}
      </PageContentMainHeading>
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
    </PageContentMain>
  );
};
