import { useMemo } from 'react';
import { AppRoutes, ChapterTitles } from '../../../universal/config/index';
import { defaultDateFormat, isLoading } from '../../../universal/helpers';
import {
  addTitleLinkComponent,
  ChapterIcon,
  InfoDetail,
  Linkd,
  OverviewPage,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
  Heading,
  LinkdInline,
} from '../../components';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './ToeristischeVerhuur.module.scss';

const DISPLAY_PROPS_VERHUUR = {
  dateRequest: 'Ontvangen op',
  dateStart: 'Start verhuur',
  dateEnd: 'Einde verhuur',
  duration: 'Aantal nachten',
};

const DISPLAY_PROPS_VERGUNNING_ACTUAL = {
  identifier: 'Huidige vergunning',
  dateStart: 'Vanaf',
  dateEnd: 'Tot en met',
  location: 'Adres',
};

const DISPLAY_PROPS_VERGUNNING_PREVIOUS = {
  identifier: 'Eerder vergunningen',
  dateStart: 'Vanaf',
  dateEnd: 'Tot en met',
  location: 'Adres',
};

export default function ToeristischeVerhuur() {
  const { TOERISTISCHE_VERHUUR } = useAppStateGetter();
  const { content } = TOERISTISCHE_VERHUUR;
  const verhuur = useMemo(() => {
    if (!content?.vergunningen?.length) {
      return [];
    }
    const items = content?.vergunningen
      ?.filter(
        (x) =>
          x.caseType === 'Vakantieverhuur' ||
          x.caseType === 'Vakantieverhuur afmelding'
      )
      .map((item) => {
        return {
          ...item,
        };
      });
    return addTitleLinkComponent(items ?? [], 'dateRequest');
  }, [content?.vergunningen]);

  const vergunningen = useMemo(() => {
    if (!content?.vergunningen?.length) {
      return [];
    }
    const items = content?.vergunningen
      ?.filter((x) => x.caseType === 'Vakantieverhuur vergunningaanvraag')
      .map((item) => {
        return {
          ...item,
          title:
            item.title.length > 45
              ? item.title.slice(0, 40) + '...'
              : item.title,
        };
      });
    return addTitleLinkComponent(items ?? [], 'identifier');
  }, [content?.vergunningen]);

  const actualVergunningen = useMemo(() => {
    return vergunningen?.filter(
      (vergunning) =>
        vergunning.caseType === 'Vakantieverhuur vergunningaanvraag' &&
        !vergunning.isPast
    );
  }, [vergunningen]);

  const previousVergunningen = useMemo(() => {
    return vergunningen?.filter(
      (vergunning) =>
        vergunning.caseType === 'Vakantieverhuur vergunningaanvraag' &&
        vergunning.isPast
    );
  }, [vergunningen]);

  const canceldVerhuur = useMemo(() => {
    return verhuur?.filter(
      (vergunning) => vergunning.caseType === 'Vakantieverhuur afmelding'
    );
  }, [verhuur]);

  const plannedVerhuur = useMemo(() => {
    return verhuur.filter(
      (vergunning) =>
        vergunning.caseType === 'Vakantieverhuur' && !vergunning.isPast
    );
  }, [verhuur]);

  const previousVerhuur = useMemo(() => {
    return verhuur.filter(
      (vergunning) =>
        vergunning.caseType === 'Vakantieverhuur' && vergunning.isPast
    );
  }, [verhuur]);

  return (
    <OverviewPage className={styles.ToeristischeVerhuur}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        icon={<ChapterIcon />}
      >
        {ChapterTitles.TOERISTISCHE_VERHUUR}
      </PageHeading>
      <PageContent>
        <p>
          Hieronder vind u een overzicht van uw aanvragen voor toeristische
          verhuur
        </p>
        <p>
          <Linkd
            external={true}
            href="https://www.amsterdam.nl/wonen-leefomgeving/wonen/vakantieverhuur/"
          >
            Meer informatie over regels voor Particuliere vakantieverhuur
          </Linkd>
          <br />
          <Linkd
            external={true}
            href="https://www.amsterdam.nl/veelgevraagd/?productid=%7BF5FE8785-9B65-443F-9AA7-FD814372C7C2%7D"
          >
            Meer over toeristenbelasting
          </Linkd>
        </p>
        {content?.registraties?.map((infoItem) => (
          <article key={infoItem.registrationNumber}>
            <InfoDetail
              label={'Landelijk registratienummer toeristische verhuur'}
              value={infoItem.registrationNumber}
            />
            <InfoDetail
              className={styles.NoBorder}
              label={'Adres verhuurde woning'}
              value={
                <>
                  {infoItem.street} {infoItem.houseNumber}
                  {infoItem.houseLetter}
                  {infoItem.houseNumberExtension}
                  <br />
                  {infoItem.postalCode} {infoItem.city}
                </>
              }
            />
          </article>
        ))}
        <div className={styles.Detail}>
          <Heading el="h3" size="tiny" className={styles.InvertedLabel}>
            U heeft nog {content?.daysLeft ?? 30} dagen dat u uw woning mag
            verhuren.
          </Heading>
          <p className={styles.DetailText}>
            Het aantal resterende nachten is gebaseerd op uw meldingen voor
            ingepland en afgelopen verhuur. Dit is zonder eventuele meldingen
            die dit jaar door een mede-verhuurder of vorige bewoner zijn gedaan.
            Kijk voor meer informatie bij{' '}
            <LinkdInline external={true} href={'www.amsterdam.nl'}>
              Vakantieverhuur melden
            </LinkdInline>
            . Aan de informatie op deze pagina kunnen geen rechten worden
            ontleend.
          </p>
        </div>
      </PageContent>
      <SectionCollapsible
        id="SectionCollapsible-vergunning-aanvraag"
        title="Vergunning vakantieverhuur"
        noItemsMessage="U hebt geen lopende aanvragen."
        hasItems={!!actualVergunningen?.length || !!previousVergunningen.length}
        startCollapsed={false}
        className={styles.SectionCollapsibleCurrent}
        isLoading={isLoading(TOERISTISCHE_VERHUUR)}
        track={{
          category: 'Toeristische verhuur / Vergunning vakantieverhuur',
          name: 'Datatabel',
        }}
      >
        <Table
          className={styles.Table}
          titleKey="identifier"
          displayProps={DISPLAY_PROPS_VERGUNNING_ACTUAL}
          items={actualVergunningen}
        />
        {!!previousVergunningen.length && (
          <Table
            className={styles.Table}
            titleKey="identifier"
            displayProps={DISPLAY_PROPS_VERGUNNING_PREVIOUS}
            items={previousVergunningen}
          />
        )}
      </SectionCollapsible>
      {!!plannedVerhuur.length && (
        <SectionCollapsible
          id="SectionCollapsible-planned-verhuur"
          title={`Geplande verhuur (${plannedVerhuur?.length})`}
          noItemsMessage="U hebt geen lopende aanvragen."
          hasItems={!!plannedVerhuur?.length}
          startCollapsed={false}
          className={styles.SectionCollapsibleCurrent}
          isLoading={isLoading(TOERISTISCHE_VERHUUR)}
          track={{
            category: 'Toeristische verhuur / Geplanned Verhuur',
            name: 'Datatabel',
          }}
        >
          <Table
            className={styles.Table}
            titleKey="dateRequest"
            displayProps={DISPLAY_PROPS_VERHUUR}
            items={plannedVerhuur}
          />
        </SectionCollapsible>
      )}
      {!!canceldVerhuur.length && (
        <SectionCollapsible
          id="SectionCollapsible-cancled-verhuur"
          title={`Afgemeld verhuur (${canceldVerhuur?.length})`}
          noItemsMessage="U hebt geen lopende aanvragen."
          hasItems={!!canceldVerhuur?.length}
          startCollapsed={false}
          className={styles.SectionCollapsibleCurrent}
          isLoading={isLoading(TOERISTISCHE_VERHUUR)}
          track={{
            category: 'Toeristische verhuur / afgemeld Verhuur',
            name: 'Datatabel',
          }}
        >
          <Table
            className={styles.Table}
            titleKey="dateRequest"
            displayProps={DISPLAY_PROPS_VERHUUR}
            items={canceldVerhuur}
          />
        </SectionCollapsible>
      )}
      {!!previousVerhuur.length && (
        <SectionCollapsible
          id="SectionCollapsible-previous-verhuur"
          title={`Afgelopen verhuur (${previousVerhuur?.length})`}
          noItemsMessage="U hebt geen lopende aanvragen."
          hasItems={!!previousVerhuur?.length}
          startCollapsed={false}
          className={styles.SectionCollapsibleCurrent}
          isLoading={isLoading(TOERISTISCHE_VERHUUR)}
          track={{
            category: 'Toeristische verhuur / afgemeld Verhuur',
            name: 'Datatabel',
          }}
        >
          <Table
            className={styles.Table}
            titleKey="dateRequest"
            displayProps={DISPLAY_PROPS_VERHUUR}
            items={previousVerhuur}
          />
        </SectionCollapsible>
      )}
    </OverviewPage>
  );
}
