import {
  Alert,
  Button,
  ChapterIcon,
  MyTips,
  MyTipsOptInOutModal,
  OverviewPage,
  PageContent,
  PageHeading,
} from '../../components';
import { ChapterTitles, FeatureToggle } from '../../../universal/config';
import React, { useContext, useState } from 'react';
import { isError, isLoading } from '../../../universal/helpers';

import { AppContext } from '../../AppState';
import styles from './MyTips.module.scss';

export default () => {
  const { TIPS } = useContext(AppContext);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <OverviewPage className={styles.MyTips}>
      <PageHeading icon={<ChapterIcon />}>{ChapterTitles.TIPS}</PageHeading>
      {FeatureToggle.myTipsoptInOutPersonalization && (
        <PageContent>
          <p>
            {!TIPS.content?.isOptIn ? (
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
              variant={
                TIPS.content?.isOptIn ? 'secondary-inverted' : 'secondary'
              }
              className={styles.OptInOutToggleButton}
              onClick={() => setModalIsOpen(true)}
              aria-expanded={modalIsOpen}
            >
              {TIPS.content?.isOptIn
                ? 'Toon geen persoonlijke tips'
                : 'Toon persoonlijke tips'}
            </Button>
          </p>
          <MyTipsOptInOutModal
            onClose={() => setModalIsOpen(false)}
            isOpen={modalIsOpen}
          />
          {isError(TIPS) && (
            <Alert type="warning">
              <p>We kunnen op dit moment geen gegevens tonen.</p>
            </Alert>
          )}
        </PageContent>
      )}
      <MyTips
        showHeader={false}
        isLoading={isLoading(TIPS)}
        items={TIPS.content?.items || []}
        isOptIn={TIPS.content?.isOptIn}
      />
    </OverviewPage>
  );
};
