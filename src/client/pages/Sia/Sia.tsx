import {
  ThumbsDownIcon,
  ThumbsUpIcon,
} from '@amsterdam/design-system-react-icons';
import classNames from 'classnames';
import { useMemo } from 'react';
import { SIAItem } from '../../../server/services/sia';
import {
  AppRoutes,
  ChapterTitles,
  Chapters,
} from '../../../universal/config/index';
import { isError, isLoading } from '../../../universal/helpers';
import { defaultDateTimeFormat } from '../../../universal/helpers/date';
import {
  Alert,
  ChapterIcon,
  MaintenanceNotifications,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
  addTitleLinkComponent,
} from '../../components';
import { OverviewPage } from '../../components/Page/Page';
import { PageTableCutoffLink } from '../../components/TablePagePaginated/TablePagePaginated';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './Sia.module.scss';

export const DISPLAY_PROPS = {
  identifier: 'Meldingsnummer',
  category: 'Categorie',
  datePublished: 'Ontvangen op',
};

export const DISPLAY_PROPS_HISTORY = {
  identifier: 'Meldingsnummer',
  category: 'Categorie',
  dateClosed: 'Afgesloten op',
};

export default function Sia() {
  const { SIA } = useAppStateGetter();

  const siaOpen: SIAItem[] = useMemo(() => {
    if (!SIA.content?.open?.items.length) {
      return [];
    }
    const items: SIAItem[] = SIA.content.open.items
      .filter((x) => x)
      .map((item) => {
        return {
          ...item,
          datePublished: defaultDateTimeFormat(item.datePublished),
        };
      });
    return addTitleLinkComponent(items, 'identifier');
  }, [SIA.content]);

  const siaClosed: SIAItem[] = useMemo(() => {
    if (!SIA.content?.afgesloten?.items.length) {
      return [];
    }
    const items: SIAItem[] = SIA.content.afgesloten.items
      .filter((x) => x)
      .map((item) => {
        return {
          ...item,
          datePublished: defaultDateTimeFormat(item.datePublished),
          dateClosed: item.dateClosed
            ? defaultDateTimeFormat(item.dateClosed)
            : null,
        };
      });
    return addTitleLinkComponent(items, 'identifier');
  }, [SIA.content]);

  return (
    <OverviewPage className={styles.Sia}>
      <PageHeading
        isLoading={false}
        icon={<ChapterIcon chapter={Chapters.SIA} />}
      >
        {ChapterTitles.SIA}
      </PageHeading>
      <PageContent>
        <p>
          Hieronder ziet u uw openstaande meldingen. En u ziet meldingen die de
          afgelopen 12 maanden zijn afgesloten. Klik op het meldingsnummer voor
          meer informatie over de melding.
        </p>
        <h3>Wat vindt u van Yivi?</h3>
        <p>
          Geef uw mening, maak een keuze hieronder. Beantwoord daarna een aantal
          vragen. Dat duurt ongeveer 3 minuten.
        </p>
        <p>
          <a
            className={classNames(styles.SurveyThumbs, styles.SurveyThumbsUp)}
            href="https://surveys.enalyzer.com/survey/linkindex?pid=b8m7pam2&mening=positief"
            rel="noopener noreferrer"
          >
            <ThumbsUpIcon /> Positief
          </a>
          <a
            className={classNames(styles.SurveyThumbs, styles.SurveyThumbsDown)}
            href="https://surveys.enalyzer.com/survey/linkindex?pid=b8m7pam2&mening=negatief"
            rel="noopener noreferrer"
          >
            <ThumbsDownIcon /> Negatief
          </a>
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
        hasItems={!!siaOpen.length}
        startCollapsed={false}
        className={styles.SectionCollapsibleCurrent}
        isLoading={isLoading(SIA)}
      >
        <Table
          className={styles.Table}
          titleKey="identifier"
          displayProps={DISPLAY_PROPS}
          items={siaOpen.slice(0, 3)}
        />
        <PageTableCutoffLink
          count={siaOpen.length}
          appRouteWithPageParam={AppRoutes.SIA_OPEN}
        />
      </SectionCollapsible>
      <SectionCollapsible
        id="SectionCollapsible-sia-previous"
        title="Afgesloten meldingen"
        noItemsMessage="U hebt geen afgesloten meldingen."
        hasItems={!!siaClosed.length}
        startCollapsed={true}
        className={styles.SectionCollapsiblePrevious}
        isLoading={isLoading(SIA)}
      >
        <Table
          className={styles.Table}
          titleKey="identifier"
          displayProps={DISPLAY_PROPS_HISTORY}
          items={siaClosed.slice(0, 3)}
        />
        <PageTableCutoffLink
          count={siaClosed.length}
          appRouteWithPageParam={AppRoutes.SIA_CLOSED}
        />
      </SectionCollapsible>
    </OverviewPage>
  );
}
