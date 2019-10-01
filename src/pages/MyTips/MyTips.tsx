import React, { useContext } from 'react';
import { OverviewPage, PageContent } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import MyTips from 'components/MyTips/MyTips';
import { AppContext } from 'AppState';
import { Chapters, ChapterTitles } from 'App.constants';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import styles from './MyTips.module.scss';
import Alert from 'components/Alert/Alert';

export default () => {
  const {
    MY_TIPS: {
      data: { items: myTips },
      isLoading: isMyTipsLoading,
      isError,
      isPristine,
    },
  } = useContext(AppContext);

  return (
    <OverviewPage className={styles.MyTips}>
      <PageHeading icon={<ChapterIcon chapter={Chapters.MIJN_TIPS} />}>
        {ChapterTitles.MIJN_TIPS}
      </PageHeading>
      <PageContent>
        <p>
          Hier ziet u een overzicht van alle tips. U kunt ook alleen tips zien
          die bij u passen. Om uw gegevens daarvoor te gebruiken hebben we uw
          toestemming nodig.
        </p>
        {isError && (
          <Alert type="warning">
            We kunnen op dit moment geen gegevens tonen.
          </Alert>
        )}
      </PageContent>
      <MyTips
        showHeader={false}
        isLoading={isPristine || isMyTipsLoading}
        items={myTips}
      />
    </OverviewPage>
  );
};
