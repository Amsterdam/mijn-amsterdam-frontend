import { Chapters } from 'App.constants';
import { AppContext } from 'AppState';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';
import MyUpdates from 'components/MyUpdates/MyUpdates';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import React, { useContext } from 'react';

import { useUpdatesState } from 'hooks/api/my-updates-api.hook';
import styles from './MyUpdates.module.scss';
import Heading from 'components/Heading/Heading';

export default () => {
  const {
    MY_UPDATES: { items, total },
  } = useContext(AppContext);
  return (
    <PageContentMain className={styles.MyUpdates} variant="full">
      <PageContentMainHeading
        variant="boxedWithIcon"
        className={styles.MainHeader}
      >
        <ChapterHeadingIcon chapter={Chapters.BURGERZAKEN} />
        Alle meldingen
      </PageContentMainHeading>
      <PageContentMainBody variant="boxed">
        <h3 className={styles.PanelHeading}>Actueel</h3>
        <MyUpdates total={total} items={items.filter(item => item.isActual)} />
      </PageContentMainBody>
      <div className={styles.PreviousUpdatesPanel}>
        <PageContentMainBody variant="boxed">
          <Heading className={styles.PanelHeading}>Eerdere meldingen</Heading>
          <MyUpdates
            total={total}
            items={items.filter(item => !item.isActual)}
          />
        </PageContentMainBody>
      </div>
    </PageContentMain>
  );
};
