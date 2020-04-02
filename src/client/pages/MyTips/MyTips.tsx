import { OverviewPage, PageContent } from '../../components/Page/Page';
import React, { useContext, useState } from 'react';

import Alert from '../../components/Alert/Alert';
import { AppContext } from '../../AppState';
import { Button } from '../../components/Button/Button';
import ChapterIcon from '../../components/ChapterIcon/ChapterIcon';
import { ChapterTitles } from '../../config/Chapter.constants';
import { FeatureToggle } from '../../config/App.constants';
import MyTips from '../../components/MyTips/MyTips';
import MyTipsOptInOutModal from '../../components/MyTips/MyTipsOptInOutModal';
import PageHeading from '../../components/PageHeading/PageHeading';
import styles from './MyTips.module.scss';

export default () => {
  const {
    MIJN_TIPS: {
      data: { items: myTips },
      isLoading: isMyTipsLoading,
      isError,
      isPristine,
      isOptIn,
    },
  } = useContext(AppContext);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <OverviewPage className={styles.MyTips}>
      <PageHeading icon={<ChapterIcon />}>
        {ChapterTitles.MIJN_TIPS}
      </PageHeading>
      {FeatureToggle.myTipsoptInOutPersonalization && (
        <PageContent>
          <p>
            {!isOptIn ? (
              <>
                U ziet nu algemene tips over voorzieningen en activiteiten in
                Amsterdam. Op basis van uw informatie die bij de gemeente bekend
                is kunnen we u ook informatie tonen die beter bij uw
                persoonlijke situatie past.
              </>
            ) : (
              <>
                U ziet nu persoonlijke tips over voorzieningen en activiteiten
                in Amsterdam. We kunnen u ook algemene informatie tonen waarbij
                geen gebruik gemaakt wordt van persoonlijke informatie.
              </>
            )}
            <Button
              variant={isOptIn ? 'secondary-inverted' : 'secondary'}
              className={styles.OptInOutToggleButton}
              onClick={() => setModalIsOpen(true)}
              aria-expanded={modalIsOpen}
            >
              {isOptIn
                ? 'Toon geen persoonlijke tips'
                : 'Toon persoonlijke tips'}
            </Button>
          </p>
          <MyTipsOptInOutModal
            onClose={() => setModalIsOpen(false)}
            isOpen={modalIsOpen}
          />
          {isError && (
            <Alert type="warning">
              <p>We kunnen op dit moment geen gegevens tonen.</p>
            </Alert>
          )}
        </PageContent>
      )}
      <MyTips
        showHeader={false}
        isLoading={isPristine || isMyTipsLoading}
        items={myTips}
        isOptIn={isOptIn}
      />
    </OverviewPage>
  );
};
