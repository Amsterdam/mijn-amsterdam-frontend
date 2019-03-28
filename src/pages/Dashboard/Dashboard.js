import React from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import styles from './Dashboard.module.scss';
import MijnUpdates from 'components/MijnUpdates/MijnUpdates';
import { useMijnUpdatesApi } from 'hooks/mijn-updates-api.hook';

export default () => {
  const updateCount = 4;
  const { data, refetch } = useMijnUpdatesApi();
  return (
    <PageContentMain className={styles.Dashboard}>
      <PageContentMainHeading variant="medium">
        Mijn updates ({updateCount})
      </PageContentMainHeading>
      <PageContentMainBody>
        <MijnUpdates items={data} />
      </PageContentMainBody>
    </PageContentMain>
  );
};
