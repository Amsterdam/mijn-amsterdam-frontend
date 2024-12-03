///all fake data below. Stole it from "Vergunningen.tsx" to make the Theme Varen work
import { useMemo } from 'react';

import styles from '../Vergunningen/Vergunningen.module.scss';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { getCustomTitleForVergunningWithLicensePlates } from '../../../universal/helpers/vergunningen';
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
import { Vergunning } from '../../../server/services';

export const DISPLAY_PROPS = {
  identifier: 'Kenmerk',
  title: 'Soort vaar',
  dateRequest: 'Aangevraagd',
};

export const DISPLAY_PROPS_HISTORY = {
  identifier: 'Kenmerk',
  title: 'Soort vaar',
  decision: 'Resultaat',
};

const titleTransformMap: Record<string, any> = {
  [CaseType.TouringcarJaarontheffing]:
    getCustomTitleForVergunningWithLicensePlates,
  [CaseType.TouringcarDagontheffing]:
    getCustomTitleForVergunningWithLicensePlates,
  [CaseType.EigenParkeerplaats]: getCustomTitleForVergunningWithLicensePlates,
  [CaseType.EigenParkeerplaatsOpheffen]:
    getCustomTitleForVergunningWithLicensePlates,
};

export default function Varen() {
  const { VAREN } = useAppStateGetter();

  const Varen: Vergunning[] = useMemo(() => {
    if (!VAREN.content?.length) {
      return [];
    }
    const items: Vergunning[] = VAREN.content
      .filter((x) => x)
      .map((item) => {
        return {
          ...item,
          title:
            item.caseType in titleTransformMap
              ? titleTransformMap[item.caseType](item)
              : item.title,
          dateRequest: defaultDateFormat(item.dateRequest),
        };
      });
    return addTitleLinkComponent(items, 'identifier');
  }, [VAREN.content]);


  return (
    <OverviewPage className={styles.Vergunningen}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        isLoading={isLoading(VAREN)}
        icon={<ThemaIcon />}
      >
        {ThemaTitles.VAREN}
      </PageHeading>
      <PageContent>
        <p>
          Hier ziet u een overzicht van uw aanvragen voor varen en ontheffingen
          bij gemeente Amsterdam.
        </p>
        <p>
          <Linkd
            external={true}
            href="https://www.amsterdam.nl/ondernemen/varen/wevos/"
          >
            Ontheffing RVV en TVM aanvragen
          </Linkd>
        </p>
        <MaintenanceNotifications page="varen" />
        {isError(VAREN) && (
          <ErrorAlert>We kunnen op dit moment geen gegevens tonen.</ErrorAlert>
        )}
      </PageContent>
      {/* <SectionCollapsible
        id="SectionCollapsible-varen-actual"
        title="Lopende aanvragen"
        noItemsMessage="U heeft geen lopende aanvragen."
        hasItems={!!varenActual.length}
        startCollapsed={false}
        className={styles.SectionCollapsibleCurrent}
        isLoading={isLoading(VAREN)}
      >
        <Table
          className={styles.Table}
          titleKey="identifier"
          displayProps={DISPLAY_PROPS}
          items={varenActual}
        />
      </SectionCollapsible>
      <SectionCollapsible
        id="SectionCollapsible-varen-previous"
        title="Eerdere aanvragen"
        noItemsMessage="U heeft geen eerdere aanvragen."
        hasItems={!!varenPrevious.length}
        startCollapsed={true}
        className={styles.SectionCollapsiblePrevious}
        isLoading={isLoading(VAREN)}
      >
        <Table
          className={styles.Table}
          titleKey="identifier"
          displayProps={DISPLAY_PROPS_HISTORY}
          items={varenPrevious}
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
          // </p> */}
      {/* </PageContent> */}
      {/* )} */}
    </OverviewPage>
  );
}
