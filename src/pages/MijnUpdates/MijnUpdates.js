import React, { useContext, useEffect } from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import styles from './MijnUpdates.module.scss';
import MijnUpdates from 'components/MijnUpdates/MijnUpdates';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';
import { Chapters } from 'App.constants';
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
    <PageContentMain className={styles.MijnUpdates} variant="full">
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
          <MijnUpdates total={total} items={items} />
        </PageContentMainBody>
      </div>
      <div className={styles.PreviousUpdatesPanel}>
        <PageContentMainBody>
          <h3 className={styles.PanelHeading}>Eerdere updates (#)</h3>
          <MijnUpdates total={total} items={items} />
        </PageContentMainBody>
      </div>
    </PageContentMain>
  );
};
