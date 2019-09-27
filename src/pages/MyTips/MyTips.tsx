import React, { useContext } from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import MyTips from 'components/MyTips/MyTips';
import { AppContext } from 'AppState';
import { Chapters, ChapterTitles } from 'App.constants';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import pageContentStyles from 'components/PageContentMain/PageContentMain.module.scss';
import styles from './MyTips.module.scss';
import classnames from 'classnames';
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
    <PageContentMain
      className={classnames(pageContentStyles.OverviewPage, styles.MyTips)}
    >
      <PageContentMainHeading
        icon={<ChapterIcon chapter={Chapters.MIJN_TIPS} />}
      >
        {ChapterTitles.MIJN_TIPS}
      </PageContentMainHeading>
      <div className={pageContentStyles.PageContent}>
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
      </div>
      <MyTips
        showHeader={false}
        isLoading={isPristine || isMyTipsLoading}
        items={myTips}
      />
    </PageContentMain>
  );
};
