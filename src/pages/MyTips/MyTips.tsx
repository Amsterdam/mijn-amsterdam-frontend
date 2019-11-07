import { Chapters, ChapterTitles, FeatureToggle } from 'App.constants';
import { AppContext } from 'AppState';
import Alert from 'components/Alert/Alert';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import MyTips from 'components/MyTips/MyTips';
import { OverviewPage, PageContent } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import React, { useContext, useState } from 'react';
import { Button } from 'components/Button/Button';
import styles from './MyTips.module.scss';
import Modal from 'components/Modal/Modal';

export default () => {
  const {
    MY_TIPS: {
      data: { items: myTips },
      isLoading: isMyTipsLoading,
      isError,
      isPristine,
      isOptIn,
      optIn,
      optOut,
    },
  } = useContext(AppContext);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <OverviewPage className={styles.MyTips}>
      <PageHeading icon={<ChapterIcon chapter={Chapters.MIJN_TIPS} />}>
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
            >
              {isOptIn
                ? 'Nee, toon geen persoonlijke tips'
                : 'Toon persoonlijke tips'}
            </Button>
          </p>
          <Modal
            isOpen={modalIsOpen}
            onClose={() => setModalIsOpen(false)}
            title="Persoonlijke tips"
            contentWidth={620}
          >
            <>
              <p className={styles.OptInOutInfo}>
                {!isOptIn ? (
                  <>
                    U ziet nu algemene tips over voorzieningen en activiteiten
                    in Amsterdam. Op basis van uw informatie die bij de gemeente
                    bekend is kunnen we u ook informatie tonen die beter bij uw
                    persoonlijk situatie past.
                  </>
                ) : (
                  <>
                    U ziet nu persoonlijke tips over voorzieningen en
                    activiteiten in Amsterdam. We kunnen u ook algemene
                    informatie tonen waarbij geen gebruik gemaakt word van
                    persoonlijke informatie.
                  </>
                )}
              </p>
              <p className={styles.OptInOutButtons}>
                <Button variant="plain" onClick={() => setModalIsOpen(false)}>
                  Nee bedankt
                </Button>
                <Button
                  variant={isOptIn ? 'secondary-inverted' : 'secondary'}
                  onClick={() => {
                    if (isOptIn) {
                      optOut();
                    } else {
                      optIn();
                    }
                    setModalIsOpen(false);
                  }}
                >
                  {isOptIn
                    ? 'Nee, toon geen persoonlijke tips'
                    : 'Toon persoonlijke tips'}
                </Button>
              </p>
            </>
          </Modal>
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
      />
    </OverviewPage>
  );
};
