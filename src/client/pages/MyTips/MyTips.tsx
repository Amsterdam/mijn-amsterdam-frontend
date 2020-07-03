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
import {
  OptInContext,
  OptInContextProvider,
} from '../../components/OptInContext/OptInContext';
import { ComponentChildren } from '../../../universal/types/App.types';

interface OptInPageContentProps {
  children: ComponentChildren;
}

function OptInPageContent({ children }: OptInPageContentProps) {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { isOptIn } = useContext(OptInContext);
  return (
    <PageContent>
      <p>
        {!isOptIn ? (
          <>
            U ziet nu algemene tips over voorzieningen en activiteiten in
            Amsterdam. Op basis van uw informatie die bij de gemeente bekend is
            kunnen we u ook informatie tonen die beter bij uw persoonlijke
            situatie past.
          </>
        ) : (
          <>
            U ziet nu persoonlijke tips over voorzieningen en activiteiten in
            Amsterdam. We kunnen u ook algemene informatie tonen waarbij geen
            gebruik gemaakt wordt van persoonlijke informatie.
          </>
        )}
        <Button
          variant={isOptIn ? 'secondary-inverted' : 'secondary'}
          className={styles.OptInOutToggleButton}
          onClick={() => setModalIsOpen(true)}
          aria-expanded={modalIsOpen}
        >
          {isOptIn ? 'Toon alle tips' : 'Toon persoonlijke tips'}
        </Button>
      </p>
      <MyTipsOptInOutModal
        onClose={() => setModalIsOpen(false)}
        isOpen={modalIsOpen}
      />
      {children}
    </PageContent>
  );
}

export default () => {
  const { TIPS } = useContext(AppContext);

  return (
    <OverviewPage className={styles.MyTips}>
      <PageHeading isLoading={isLoading(TIPS)} icon={<ChapterIcon />}>
        {ChapterTitles.TIPS}
      </PageHeading>
      {FeatureToggle.myTipsoptInOutPersonalization && (
        <OptInContextProvider>
          <OptInPageContent>
            {isError(TIPS) && (
              <Alert type="warning">
                <p>We kunnen op dit moment geen gegevens tonen.</p>
              </Alert>
            )}
          </OptInPageContent>
        </OptInContextProvider>
      )}
      <MyTips
        showHeader={false}
        isLoading={isLoading(TIPS)}
        items={TIPS.content?.items || []}
      />
    </OverviewPage>
  );
};
