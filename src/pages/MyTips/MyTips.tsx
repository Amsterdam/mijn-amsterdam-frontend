import React, { useContext } from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import MyTips from 'components/MyTips/MyTips';
import { AppContext } from 'AppState';
import { Chapters, ChapterTitles } from 'App.constants';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';

export default () => {
  const {
    MY_TIPS: {
      data: { items: myTips },
      isLoading: isMyTipsLoading,
    },
  } = useContext(AppContext);
  return (
    <PageContentMain>
      <PageContentMainHeading
        icon={<ChapterIcon chapter={Chapters.MIJN_TIPS} />}
      >
        {ChapterTitles.MIJN_TIPS}
      </PageContentMainHeading>
      <MyTips showHeader={false} isLoading={isMyTipsLoading} items={myTips} />
    </PageContentMain>
  );
};
