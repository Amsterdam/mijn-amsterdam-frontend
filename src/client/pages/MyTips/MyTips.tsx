import React, { useState } from 'react';
import { ChapterTitles, FeatureToggle } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import { ComponentChildren } from '../../../universal/types/App.types';
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
import { useAppStateGetter } from '../../hooks/useAppState';
import { useOptIn } from '../../hooks/useOptIn';
import styles from './MyTips.module.scss';

interface OptInPageContentProps {
  children: ComponentChildren;
}

function OptInPageContent({ children }: OptInPageContentProps) {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { isOptIn } = useOptIn();
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
          {isOptIn ? 'Toon alle tips' : 'Maak tips persoonlijk'}
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

export default function MyTipsPage() {
  const { TIPS } = useAppStateGetter();
  return (
    <OverviewPage className={styles.MyTips}>
      <PageHeading isLoading={false} icon={<ChapterIcon />}>
        {ChapterTitles.TIPS}
      </PageHeading>
      {FeatureToggle.myTipsoptInOutPersonalization && (
        <OptInPageContent>
          {isError(TIPS) && (
            <Alert type="warning">
              <p>We kunnen op dit moment geen gegevens tonen.</p>
            </Alert>
          )}
        </OptInPageContent>
      )}
      <MyTips
        showHeader={false}
        isLoading={isLoading(TIPS)}
        items={TIPS.content || []}
      />
    </OverviewPage>
  );
}
