import React from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import styles from './Dashboard.module.scss';
import MijnUpdates from 'components/MijnUpdates/MijnUpdates';
import { useMijnUpdatesApi } from 'hooks/mijn-updates-api.hook';
import MyChaptersPanel from 'components/MyChaptersPanel/MyChaptersPanel';
import DirectLinks from 'components/DirectLinks/DirectLinks';
import MyCases from 'components/MyCases/MyCases';
import { useMyCasesApi } from 'hooks/my-cases-api.hook';

export default () => {
  const {
    data: { items: myUpdates, total: myUpdatesTotal },
  } = useMijnUpdatesApi();

  const {
    data: { items: myCases },
  } = useMyCasesApi();

  return (
    <PageContentMain className={styles.Dashboard}>
      <PageContentMainHeading variant="medium">
        Mijn updates ({myUpdatesTotal})
      </PageContentMainHeading>
      <PageContentMainBody>
        <MijnUpdates total={myUpdatesTotal} items={myUpdates} />
        <MyChaptersPanel title="Mijn thema's" />
        <DirectLinks title="Direct naar" />
        <MyCases title="Mijn lopende zaken" items={myCases} />
      </PageContentMainBody>
    </PageContentMain>
  );
};
