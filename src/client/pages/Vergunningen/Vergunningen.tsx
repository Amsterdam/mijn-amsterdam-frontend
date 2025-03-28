import { useMemo } from 'react';

import { useVergunningenTransformed } from './useVergunningenTransformed.hook';
import styles from './Vergunningen.module.scss';
import type { Vergunning } from '../../../server/services/vergunningen/vergunningen';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { CaseType } from '../../../universal/types/vergunningen';
import {
  ErrorAlert,
  Linkd,
  MaintenanceNotifications,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
  ThemaIcon,
  addTitleLinkComponent,
} from '../../components';
import { OverviewPage } from '../../components/Page/Page';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';
import { hasMultiplePermits } from '../VergunningDetail/WVOS';

export const DISPLAY_PROPS = {
  identifier: 'Kenmerk',
  title: 'Soort vergunning',
  dateRequest: 'Aangevraagd',
};

export const DISPLAY_PROPS_HISTORY = {
  identifier: 'Kenmerk',
  title: 'Soort vergunning',
  decision: 'Resultaat',
};

export default function Vergunningen() {
  const { VERGUNNINGEN } = useAppStateGetter();

  let vergunningen: Vergunning[] = useVergunningenTransformed(VERGUNNINGEN);
  vergunningen = addTitleLinkComponent(vergunningen, 'identifier');

  const vergunningenPrevious = useMemo(() => {
    return vergunningen
      .filter((vergunning) => vergunning.processed)
      .map((vergunning) => {
        if (
          vergunning.caseType === CaseType.WVOS &&
          hasMultiplePermits(vergunning)
        ) {
          return {
            ...vergunning,
            decision: 'Zie besluit',
          };
        }
        return vergunning;
      });
  }, [vergunningen]);

  const vergunningenActual = useMemo(() => {
    return vergunningen.filter((vergunning) => !vergunning.processed);
  }, [vergunningen]);

  const hasActualGPK = vergunningenActual.find(
    (vergunning) => vergunning.caseType === CaseType.GPK
  );

  return (
    <OverviewPage className={styles.Vergunningen}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        isLoading={isLoading(VERGUNNINGEN)}
        icon={<ThemaIcon />}
      >
        {ThemaTitles.VERGUNNINGEN}
      </PageHeading>
      <PageContent>
        <p>
          Hier ziet u een overzicht van uw aanvragen voor vergunningen en
          ontheffingen bij gemeente Amsterdam.
        </p>
        <p>
          <Linkd
            external={true}
            href="https://www.amsterdam.nl/ondernemen/vergunningen/wevos/"
          >
            Ontheffing RVV en TVM aanvragen
          </Linkd>
        </p>
        <MaintenanceNotifications page="vergunningen" />
        {isError(VERGUNNINGEN) && (
          <ErrorAlert>We kunnen op dit moment geen gegevens tonen.</ErrorAlert>
        )}
      </PageContent>
      <SectionCollapsible
        id="SectionCollapsible-vergunningen-actual"
        title="Lopende aanvragen"
        noItemsMessage="U heeft geen lopende aanvragen."
        hasItems={!!vergunningenActual.length}
        startCollapsed={false}
        className={styles.SectionCollapsibleCurrent}
        isLoading={isLoading(VERGUNNINGEN)}
      >
        <Table
          className={styles.Table}
          titleKey="identifier"
          displayProps={DISPLAY_PROPS}
          items={vergunningenActual}
        />
      </SectionCollapsible>
      <SectionCollapsible
        id="SectionCollapsible-vergunningen-previous"
        title="Eerdere aanvragen"
        noItemsMessage="U heeft geen eerdere aanvragen."
        hasItems={!!vergunningenPrevious.length}
        startCollapsed={true}
        className={styles.SectionCollapsiblePrevious}
        isLoading={isLoading(VERGUNNINGEN)}
      >
        <Table
          className={styles.Table}
          titleKey="identifier"
          displayProps={DISPLAY_PROPS_HISTORY}
          items={vergunningenPrevious}
        />
      </SectionCollapsible>
      {hasActualGPK && (
        <PageContent>
          <p className={styles.SuppressedParagraph}>
            Hebt u naast een Europese gehandicaptenparkeerkaart (GPK) ook een
            vaste parkeerplaats voor gehandicapten (GPP) aangevraagd? Dan ziet u
            hier in Mijn Amsterdam alleen de aanvraag voor een GPK staan. Zodra
            de GPK is gegeven, ziet u ook uw aanvraag voor uw GPP in Mijn
            Amsterdam.
          </p>
        </PageContent>
      )}
    </OverviewPage>
  );
}
