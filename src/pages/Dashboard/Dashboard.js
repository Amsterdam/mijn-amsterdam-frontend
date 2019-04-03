import React from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import styles from './Dashboard.module.scss';
import MijnUpdates from 'components/MijnUpdates/MijnUpdates';
import { useMijnUpdatesApi } from 'hooks/mijn-updates-api.hook';
import { useMyTipsApi } from 'hooks/my-tips-api.hooks';
import DirectLinks from 'components/DirectLinks/DirectLinks';
import MyTips from 'components/MyTips/MyTips';

export default () => {
  const {
    data: { items: updateItems, total: updateItemsCount },
  } = useMijnUpdatesApi();

  const {
    data: { items: tips },
  } = useMyTipsApi();

  return (
    <PageContentMain className={styles.Dashboard}>
      <PageContentMainHeading variant="medium">
        Mijn updates ({updateItemsCount})
      </PageContentMainHeading>
      <PageContentMainBody>
        <MijnUpdates total={updateItemsCount} items={updateItems} />
        <MyTips items={tips} />
        <DirectLinks />
      </PageContentMainBody>
    </PageContentMain>
  );
};
