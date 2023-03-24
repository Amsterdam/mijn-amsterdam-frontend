import { useMemo } from 'react';
import { SIAItem } from '../../../server/services/sia';
import { AppRoutes, ChapterTitles } from '../../../universal/config/index';
import { isError, isLoading } from '../../../universal/helpers';
import { defaultDateTimeFormat } from '../../../universal/helpers/date';
import {
  addTitleLinkComponent,
  Alert,
  ChapterIcon,
  Linkd,
  MaintenanceNotifications,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
} from '../../components';
import { OverviewPage } from '../../components/Page/Page';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './Sia.module.scss';

const DISPLAY_PROPS = {
  identifier: 'Meldingsnummer',
  category: 'Categorie',
  address: 'Adres',
  datePublished: 'Melding ontvangen',
};

const DISPLAY_PROPS_HISTORY = {
  identifier: 'Meldingsnummer',
  category: 'Categorie',
  address: 'Adres',
  dateClosed: 'Melding afgehandeld',
};

export default function Sia() {
  const { SIA } = useAppStateGetter();

  const sia: SIAItem[] = useMemo(() => {
    if (!SIA.content?.length) {
      return [];
    }
    const items: SIAItem[] = SIA.content
      .filter((x) => x)
      .map((item) => {
        return {
          ...item,
          datePublished: defaultDateTimeFormat(item.datePublished),
          dateClosed: item.dateClosed
            ? defaultDateTimeFormat(item.datePublished)
            : null,
        };
      });
    return addTitleLinkComponent(items, 'identifier');
  }, [SIA.content]);

  const siaPrevious = useMemo(() => {
    return sia.filter((vergunning) => vergunning.status === 'Afgesloten');
  }, [sia]);

  const siaActual = useMemo(() => {
    return sia.filter((vergunning) => vergunning.status !== 'Afgesloten');
  }, [sia]);

  return (
    <OverviewPage className={styles.Sia}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        isLoading={isLoading(SIA)}
        icon={<ChapterIcon />}
      >
        {ChapterTitles.SIA}
      </PageHeading>
      <PageContent>
        <p>
          U hebt uw mailadres en telefoonnummer doorgegeven zodat u op de hoogte
          wordt gehouden over de voortgang van uw melding. U kunt deze gegevens
          hier niet meer wijzigen. 12 maanden na ontvangst van uw melding worden
          deze gegevens automatisch verwijderd uit ons systeem.
        </p>
        <p>
          <Linkd
            external={true}
            href="https://www.amsterdam.nl/wonen-leefomgeving/melding-openbare-ruimte-en-overlast/"
          >
            Meer informatie
          </Linkd>
          <br />
          <Linkd external={true} href="https://meldingen.amsterdam.nl">
            Doe een melding
          </Linkd>
        </p>
        <MaintenanceNotifications page="sia-meldingen" />
        {isError(SIA) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
      </PageContent>
      <SectionCollapsible
        id="SectionCollapsible-sia-actual"
        title="Openstaande meldingen"
        noItemsMessage="U hebt geen openstaande meldingen."
        hasItems={!!siaActual.length}
        startCollapsed={false}
        className={styles.SectionCollapsibleCurrent}
        isLoading={isLoading(SIA)}
        track={{
          category: 'Sia overzicht / Openstaande meldingen',
          name: 'Datatabel',
        }}
      >
        <Table
          className={styles.Table}
          titleKey="caseType"
          displayProps={DISPLAY_PROPS}
          items={siaActual}
        />
      </SectionCollapsible>
      <SectionCollapsible
        id="SectionCollapsible-sia-previous"
        title="Afgesloten meldingen"
        noItemsMessage="U hebt geen afgesloten meldingen."
        hasItems={!!siaPrevious.length}
        startCollapsed={true}
        className={styles.SectionCollapsiblePrevious}
        isLoading={isLoading(SIA)}
        track={{
          category: 'Sia overzicht / Afgesloten meldingen',
          name: 'Datatabel',
        }}
      >
        <Table
          className={styles.Table}
          titleKey="caseType"
          displayProps={DISPLAY_PROPS_HISTORY}
          items={siaPrevious}
        />
      </SectionCollapsible>
    </OverviewPage>
  );
}
