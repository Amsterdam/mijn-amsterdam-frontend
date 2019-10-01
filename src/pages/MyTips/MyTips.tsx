import React, { useContext } from 'react';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import MyTips from 'components/MyTips/MyTips';
import { AppContext } from 'AppState';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';
import { Chapters, ChapterTitles } from 'App.constants';

export default () => {
  const {
    MY_TIPS: {
      data: { items: myTips },
      isLoading: isMyTipsLoading,
    },
  } = useContext(AppContext);
  return (
    <PageContentMain>
      <PageContentMainHeading variant="boxedWithIcon">
        <ChapterHeadingIcon chapter={Chapters.MIJN_TIPS} />
        {ChapterTitles.MIJN_TIPS}
      </PageContentMainHeading>
      <PageContentMainBody variant="regularBoxed">
        <MyTips showHeader={false} isLoading={isMyTipsLoading} items={myTips} />
      </PageContentMainBody>
    </PageContentMain>
  );
};
