import React, { useMemo } from 'react';

import { ToeristischeVerhuurRegistratie } from '../../../server/services/toeristische-verhuur';
import { AppRoutes, ChapterTitles } from '../../../universal/config/index';
import { defaultDateFormat, isError } from '../../../universal/helpers';
import {
  addTitleLinkComponent,
  Alert,
  ChapterIcon,
  Heading,
  InfoDetail,
  Linkd,
  LinkdInline,
  MaintenanceNotifications,
  OverviewPage,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
} from '../../components';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './ToeristischeVerhuur.module.scss';

const DISPLAY_PROPS_VERHUUR = {
  dateStart: 'Start verhuur',
  dateEnd: 'Einde verhuur',
  dateRequest: 'Ontvangen op',
  duration: 'Aantal nachten',
};

const DISPLAY_PROPS_VERGUNNINGEN = {
  title: '',
  status: 'Status',
  dateStart: 'Vanaf',
  dateEnd: 'Tot',
};

export default function ToeristischeVerhuur() {
  const { TOERISTISCHE_VERHUUR } = useAppStateGetter();
  const { content } = TOERISTISCHE_VERHUUR;

  const [verhuur, vergunningen] = useMemo(() => {
    if (!content?.vergunningen?.length) {
      return [[], []];
    }

    const verhuur = [];
    const vergunningen = [];

    for (const vergunning of content.vergunningen) {
      const displayVergunning = {
        ...vergunning,
        status:
          vergunning.status === 'Afgehandeld'
            ? vergunning.decision ?? vergunning.status
            : vergunning.status,
        dateRequest: defaultDateFormat(vergunning.dateRequest),
        dateEnd: vergunning.dateEnd
          ? defaultDateFormat(vergunning.dateEnd)
          : null,
        dateStart: vergunning.dateStart
          ? defaultDateFormat(vergunning.dateStart)
          : null,
      };
      if (
        ['Vergunning bed & breakfast', 'Vergunning vakantieverhuur'].includes(
          vergunning.title
        )
      ) {
        // We consider expired B&B permits as not relevent for the user.
        if (
          vergunning.title === 'Vergunning bed & breakfast' &&
          !vergunning.isActual
        ) {
          continue;
        }
        vergunningen.push(displayVergunning);
      } else {
        verhuur.push(displayVergunning);
      }
    }

    return [
      addTitleLinkComponent(verhuur, 'dateStart'),
      addTitleLinkComponent(vergunningen, 'title'),
    ];
  }, [content?.vergunningen]);

  const hasVergunningenVakantieVerhuur = useMemo(() => {
    return vergunningen.some(
      (vergunning) =>
        vergunning.caseType === 'Vakantieverhuur vergunningsaanvraag'
    );
  }, [vergunningen]);

  const hasVergunningBB = useMemo(() => {
    return vergunningen.some(
      (vergunning) => vergunning.caseType === 'B&B - vergunning'
    );
  }, [vergunningen]);

  const cancelledVerhuur = useMemo(() => {
    return verhuur.filter(
      (vergunning) =>
        vergunning.caseType === 'Vakantieverhuur' && vergunning.cancelled
    );
  }, [verhuur]);

  const plannedVerhuur = useMemo(() => {
    return verhuur.filter(
      (vergunning) =>
        vergunning.caseType === 'Vakantieverhuur' &&
        !vergunning.cancelled &&
        vergunning.isActual
    );
  }, [verhuur]);

  const previousVerhuur = useMemo(() => {
    return verhuur.filter(
      (vergunning) =>
        vergunning.caseType === 'Vakantieverhuur' &&
        !vergunning.cancelled &&
        !vergunning.isActual
    );
  }, [verhuur]);

  const isCollapsed = (listTitle: string): boolean => {
    switch (listTitle) {
      case 'geannuleerd':
        return !!plannedVerhuur.length;
      case 'previous':
        return !!(plannedVerhuur.length || cancelledVerhuur.length);
      case 'vergunningen':
        return !(plannedVerhuur.length && cancelledVerhuur.length);
      default:
        return false;
    }
  };

  const hasPermits = hasVergunningenVakantieVerhuur || hasVergunningBB;
  const hasBothPermits = hasVergunningenVakantieVerhuur && hasVergunningBB;
  const daysRemaining = Math.max(0, content?.daysLeft ?? 30);

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
          Hieronder vindt u een overzicht van uw aanvragen voor toeristische
          verhuur.
        </p>

        <p>
          {(hasBothPermits || !hasVergunningBB) && (
            <Linkd
              external={true}
              href="https://www.amsterdam.nl/wonen-leefomgeving/wonen/vakantieverhuur/"
            >
              Meer informatie over particuliere vakantieverhuur
            </Linkd>
          )}

          {(hasBothPermits || !hasVergunningenVakantieVerhuur) && (
            <Linkd
              external={true}
              href="https://www.amsterdam.nl/wonen-leefomgeving/wonen/bedandbreakfast/"
            >
              Meer informatie over bed &amp; breakfast
            </Linkd>
          )}

          {hasPermits && !hasBothPermits && (
            <>
              <br />
              <Linkd
                external={true}
                href="https://www.amsterdam.nl/veelgevraagd/?productid=%7BF5FE8785-9B65-443F-9AA7-FD814372C7C2%7D"
              >
                Meer over toeristenbelasting
              </Linkd>
            </>
          )}

          <MaintenanceNotifications page="toeristische-verhuur" />
        </p>
        {isError(TOERISTISCHE_VERHUUR) && (
          <Alert type="warning">
            <p>We kunnen op dit moment niet alle gegevens tonen.</p>
          </Alert>
        )}
        <div className={styles.Detail}>
          {hasVergunningenVakantieVerhuur && (
            <>
              <Heading el="h3" size="tiny" className={styles.InvertedLabel}>
                {daysRemaining === 0 && (
                  <>
                    U mag uw woning dit kalenderjaar niet meer verhuren voor
                    vakantieverhuur. <br />
                    Uw woning is dit kalenderjaar al 30 nachten verhuurd.
                  </>
                )}
                {daysRemaining > 0 && (
                  <>
                    U heeft nog {daysRemaining} dagen dat u uw woning mag
                    verhuren.
                  </>
                )}
              </Heading>
              <p className={styles.DetailText}>
                Het aantal resterende nachten is gebaseerd op uw meldingen voor
                ingepland en afgelopen verhuur. Dit is zonder eventuele
                meldingen die dit jaar door een mede-verhuurder of vorige
                bewoner zijn gedaan. Kijk voor meer informatie bij{' '}
                <LinkdInline
                  external={true}
                  href="https://www.amsterdam.nl/wonen-leefomgeving/wonen/vakantieverhuur/melden"
                >
                  Vakantieverhuur melden
                </LinkdInline>
                . Aan de informatie op deze pagina kunnen geen rechten worden
                ontleend.
              </p>
            </>
          )}
        </div>
      </PageContent>
      {hasVergunningenVakantieVerhuur && (
        <>
          <SectionCollapsible
            id="SectionCollapsible-planned-verhuur"
            title="Geplande verhuur"
            className={styles.SectionBorderTop}
            startCollapsed={false}
            hasItems={!!plannedVerhuur.length}
            noItemsMessage="Er is geen geplande verhuur gevonden."
            track={{
              category: 'Toeristische verhuur / Geplande Verhuur',
              name: 'Datatabel',
            }}
          >
            <Table
              className={styles.Table}
              titleKey="dateStart"
              displayProps={DISPLAY_PROPS_VERHUUR}
              items={plannedVerhuur}
            />
          </SectionCollapsible>
          <SectionCollapsible
            id="SectionCollapsible-cancelled-verhuur"
            title="Geannuleerde verhuur"
            startCollapsed={isCollapsed('geannuleerd')}
            hasItems={!!cancelledVerhuur.length}
            noItemsMessage="Er is geen geannuleerde verhuur gevonden."
            track={{
              category: 'Toeristische verhuur / afgemeld Verhuur',
              name: 'Datatabel',
            }}
          >
            <Table
              className={styles.Table}
              titleKey="dateStart"
              displayProps={DISPLAY_PROPS_VERHUUR}
              items={cancelledVerhuur}
            />
          </SectionCollapsible>
          <SectionCollapsible
            id="SectionCollapsible-previous-verhuur"
            title="Afgelopen verhuur"
            noItemsMessage="Er is geen afgelopen verhuur gevonden."
            startCollapsed={isCollapsed('previous')}
            hasItems={!!previousVerhuur.length}
            track={{
              category: 'Toeristische verhuur / afgelopen Verhuur',
              name: 'Datatabel',
            }}
          >
            <Table
              className={styles.Table}
              titleKey="dateStart"
              displayProps={DISPLAY_PROPS_VERHUUR}
              items={previousVerhuur}
            />
          </SectionCollapsible>
        </>
      )}
      <SectionCollapsible
        id="SectionCollapsible-vergunningen"
        className={styles.SectionNoBorderBottom}
        title="Vergunningen"
        hasItems={!!vergunningen.length}
        noItemsMessage="U hebt nog geen vergunningen."
        startCollapsed={true}
        track={{
          category: 'Toeristische verhuur / vergunningen',
          name: 'Datatabel',
        }}
      >
        {vergunningen && (
          <Table
            className={styles.TableVergunningen}
            titleKey="title"
            displayProps={DISPLAY_PROPS_VERGUNNINGEN}
            items={vergunningen}
          />
        )}
      </SectionCollapsible>

      {!!content?.registraties.length && (
        <PageContent>
          <InfoDetail
            label="Registratienummer toeristische verhuur"
            valueWrapperElement="div"
            value={content?.registraties?.map(
              (registrationItem: ToeristischeVerhuurRegistratie) => (
                <article
                  key={registrationItem.registrationNumber}
                  className={styles.RegistrationNumber}
                >
                  <span>{registrationItem.registrationNumber}</span>
                  <br />
                  {registrationItem.street} {registrationItem.houseNumber}
                  {registrationItem.houseLetter}
                  {registrationItem.houseNumberExtension}
                  {registrationItem.postalCode} {registrationItem.city}
                </article>
              )
            )}
          />
        </PageContent>
      )}
    </OverviewPage>
  );
}
