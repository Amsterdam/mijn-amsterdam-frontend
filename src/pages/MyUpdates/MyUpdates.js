import React, { useContext, useEffect } from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import styles from './MyUpdates.module.scss';
import MyUpdates from 'components/MyUpdates/MyUpdates';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';
import { Chapters } from 'App.constants';
import Heading from 'components/Heading/Heading';
import { AppContext } from 'AppState';

const MAX_UPDATES_VISIBLE = 200;

export default () => {
  const {
    MY_UPDATES: {
      refetch,
      data: { items, total },
      isLoading,
      isDirty,
    },
  } = useContext(AppContext);

  useEffect(() => {
    // If there are more items available then currently loaded, fetch more items
    if (
      !isDirty ||
      (total > items.length && items.length < MAX_UPDATES_VISIBLE && !isLoading)
    ) {
      refetch({ offset: items.length, limit: MAX_UPDATES_VISIBLE });
    }
  }, []);

  return (
    <PageContentMain className={styles.MyUpdates} variant="full">
      <div className={styles.LatestUpdatesPanel}>
        <PageContentMainHeading
          variant="withIcon"
          className={styles.MainHeader}
        >
          <ChapterHeadingIcon chapter={Chapters.BURGERZAKEN} />
          Alle updates
        </PageContentMainHeading>
        <PageContentMainBody>
          <h3 className={styles.PanelHeading}>Nieuw (#)</h3>
          <MyUpdates total={total} items={items} />
        </PageContentMainBody>
      </div>
      <div className={styles.PreviousUpdatesPanel}>
        <PageContentMainBody>
          <Heading className={styles.PanelHeading}>Eerdere updates (#)</Heading>
          <MyUpdates total={total} items={items} />
        </PageContentMainBody>
      </div>
    </PageContentMain>
  );
};
