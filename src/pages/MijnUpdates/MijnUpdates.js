import React from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import styles from './MijnUpdates.module.scss';
import MijnUpdates from 'components/MijnUpdates/MijnUpdates';
import { useMijnUpdatesApi } from 'hooks/mijn-updates-api.hook';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';
import { Chapters } from 'App.constants';

export default () => {
  const {
    data: { items, total },
  } = useMijnUpdatesApi(0, 200);

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
