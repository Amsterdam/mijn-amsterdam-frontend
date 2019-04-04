import React, { useContext } from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import styles from './Dashboard.module.scss';
import MijnUpdates from 'components/MijnUpdates/MijnUpdates';
import MyChaptersPanel from 'components/MyChaptersPanel/MyChaptersPanel';
import DirectLinks from 'components/DirectLinks/DirectLinks';
import { AppContext } from 'AppState';

const MAX_UPDATES_VISIBLE = 3;

export default () => {
  const {
    MY_UPDATES: {
      data: { items, total },
    },
  } = useContext(AppContext);

  return (
    <PageContentMain className={styles.Dashboard}>
      <PageContentMainHeading variant="medium">
        Mijn updates ({total})
      </PageContentMainHeading>
      <PageContentMainBody>
        <MijnUpdates
          total={total}
          items={items.slice(0, MAX_UPDATES_VISIBLE)}
        />
        <MyChaptersPanel title="Mijn thema's" />
        <DirectLinks />
      </PageContentMainBody>
    </PageContentMain>
  );
};
