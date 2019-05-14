import { AppContext } from 'AppState';
import DirectLinks from 'components/DirectLinks/DirectLinks';
import MyArea from 'components/MyArea/MyArea';
import MyCases from 'components/MyCases/MyCases';
import MyChaptersPanel from 'components/MyChaptersPanel/MyChaptersPanel';
import MyTips from 'components/MyTips/MyTips';
import MyUpdates from 'components/MyUpdates/MyUpdates';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import React, { useContext } from 'react';

import styles from './Dashboard.module.scss';

const MAX_UPDATES_VISIBLE = 3;
const MAX_TIPS_VISIBLE = 3;

export default () => {
  const {
    MY_UPDATES,
    MY_CASES: {
      data: { items: myCases },
    },
    MY_TIPS: {
      data: { items: myTips },
    },
    MY_CHAPTERS,
  } = useContext(AppContext);

  return (
    <PageContentMain className={styles.Dashboard} variant="full">
      <PageContentMainHeading variant="medium">
        Mijn meldingen{' '}
        {MY_UPDATES.total > 0 && <span>({MY_UPDATES.total})</span>}
      </PageContentMainHeading>
      <PageContentMainBody variant="regularBoxed" className={styles.FirstBody}>
        <MyUpdates
          total={MY_UPDATES.total}
          items={MY_UPDATES.items.slice(0, MAX_UPDATES_VISIBLE)}
        />
        <MyChaptersPanel items={MY_CHAPTERS} title="Mijn thema's" />
        <MyCases title="Mijn lopende aanvragen" items={myCases} />
      </PageContentMainBody>
      <PageContentMainBody>
        <MyArea />
      </PageContentMainBody>
      <PageContentMainBody variant="regularBoxed">
        <MyTips items={myTips.slice(0, MAX_TIPS_VISIBLE)} />
        <DirectLinks />
      </PageContentMainBody>
    </PageContentMain>
  );
};
