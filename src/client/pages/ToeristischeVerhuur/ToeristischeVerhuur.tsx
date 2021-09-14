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
import { getYear } from 'date-fns';

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

const GEPLAND_DISCLAIMER =
  'U ziet hieronder alleen meldingen die vanaf 8 april zijn ingepland. Meldingen die u vóór 8 april hebt ingepland kunnen niet worden getoond.';

const GEANNULEERD_DISCLAIMER =
  'U ziet hieronder alleen meldingen die vanaf 19 juli zijn geannuleerd. Meldingen die u vóór 19 juli hebt geannuleerd kunnen niet worden getoond.';

const AFGEROND_DISCLAIMER =
  'U ziet hieronder alleen meldingen die na 8 april zijn afgerond. Meldingen die vóór 8 april zijn afgerond kunnen niet worden getoond.';

const BB_VERGUNNING_DISCLAIMER =
  'Bed & breakfast vergunningen die vóór 14 mei 2021 zijn aangevraagd kunnen niet worden getoond';

export default function ToeristischeVerhuur() {
  const { TOERISTISCHE_VERHUUR } = useAppStateGetter();
  const { content } = TOERISTISCHE_VERHUUR;

  const hasVergunningenVakantieVerhuur = useMemo(() => {
    return content?.vergunningen.some(
      (vergunning) => vergunning.title === 'Vergunning vakantieverhuur'
    );
  }, [content?.vergunningen]);

  const hasVergunningenVakantieVerhuurVerleend = useMemo(() => {
    return content?.vergunningen.some(
      (vergunning) =>
        vergunning.title === 'Vergunning vakantieverhuur' &&
        vergunning.decision === 'Verleend'
    );
  }, [content?.vergunningen]);

  const hasVergunningBB = useMemo(() => {
    return content?.vergunningen.some(
      (vergunning) => vergunning.title === 'Vergunning bed & breakfast'
    );
  }, [content?.vergunningen]);
  const hasVergunningBBVerleend = useMemo(() => {
    return content?.vergunningen.some(
      (vergunning) =>
        vergunning.title === 'Vergunning bed & breakfast' &&
        vergunning.decision === 'Verleend'
    );
  }, [content?.vergunningen]);
  const [verhuur, vergunningen] = useMemo(() => {
    if (!content?.vergunningen?.length) {
      return [[], []];
    }

    const verhuur = [];
    const vergunningen = [];

    for (const vergunning of content.vergunningen) {
      const displayVergunning = {
        ...vergunning,
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

  const cancelledVerhuur = useMemo(() => {
    return verhuur.filter(
      (verhuur) => verhuur.title === 'Geannuleerde verhuur'
    );
  }, [verhuur]);

  const plannedVerhuur = useMemo(() => {
    return verhuur.filter((verhuur) => verhuur.title === 'Geplande verhuur');
  }, [verhuur]);

  const previousVerhuur = useMemo(() => {
    return verhuur.filter((verhuur) => verhuur.title === 'Afgelopen verhuur');
  }, [verhuur]);

  const isCollapsed = (listTitle: string): boolean => {
    switch (listTitle) {
      case 'gepland':
        return !plannedVerhuur.length && !!verhuur.length;
      case 'geannuleerd':
        return (
          !!plannedVerhuur.length ||
          (!plannedVerhuur.length && !!verhuur.length)
        );
      case 'previous':
        return (
          !!plannedVerhuur.length ||
          !!cancelledVerhuur.length ||
          !verhuur.length
        );
      case 'vergunningen':
        return (
          !(!!plannedVerhuur.length && !!cancelledVerhuur.length) ||
          !verhuur.length
        );
      default:
        return false;
    }
  };
  const hasRegistrations = !!content?.registraties.length;
  const hasPermits = hasVergunningenVakantieVerhuur || hasVergunningBB;
  const hasBothPermits = hasVergunningenVakantieVerhuur && hasVergunningBB;
  const hasBothVerleend =
    hasVergunningenVakantieVerhuurVerleend && hasVergunningBBVerleend;
  const daysRemaining = Math.max(0, content?.daysLeft ?? 30);
  const is2021 = getYear(new Date()) === 2021;

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
          {!hasVergunningBB && (
            <>
              <Linkd
                external={true}
                href="https://www.amsterdam.nl/wonen-leefomgeving/wonen/vakantieverhuur/"
              >
                Meer informatie over particuliere vakantieverhuur
              </Linkd>
              <br />
            </>
          )}

          {hasVergunningBB && !hasBothPermits && (
            <>
              <Linkd
                external={true}
                href="https://www.amsterdam.nl/wonen-leefomgeving/wonen/bedandbreakfast/"
              >
                Meer informatie over bed &amp; breakfast
              </Linkd>
              <br />
            </>
          )}

          <Linkd
            external={true}
            href="https://www.amsterdam.nl/veelgevraagd/?productid=%7BF5FE8785-9B65-443F-9AA7-FD814372C7C2%7D"
          >
            Meer over toeristenbelasting
          </Linkd>

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
                    vakantieverhuur.
                    <br />
                    Uw woning is dit kalenderjaar al 30 nachten verhuurd.
                  </>
                )}
                {daysRemaining > 0 && (
                  <>
                    U hebt nog {daysRemaining} nachten dat u uw woning mag
                    verhuren.
                  </>
                )}
              </Heading>
              {is2021 ? (
                <p className={styles.DetailText}>
                  Het aantal resterende nachten is gebaseerd op meldingen voor
                  ingepland en afgelopen verhuur die u vanaf 8 april 2021 hebt
                  ingediend en annuleringen die u vanaf{' '}
                  <strong> vanaf 19 juli</strong> hebt ingediend. Meldingen die
                  u voor 8 april 2021 hebt ingediend zijn niet meegenomen bij
                  deze berekening. Dit geldt ook voor eventuele meldingen die
                  dit jaar door een mede-verhuurder of vorige bewoner zijn
                  gedaan.
                </p>
              ) : (
                <p className={styles.DetailText}>
                  Het aantal resterende nachten is gebaseerd op uw meldingen
                  voor ingeplande en afgelopen verhuur. Dit is zonder eventuele
                  meldingen die dit jaar door een mede-verhuurder of vorige
                  bewoner zijn gedaan.
                </p>
              )}
              <p>
                Aan de informatie op deze pagina kunnen geen rechten worden
                ontleend. Kijk voor meer informatie bij{' '}
                <LinkdInline
                  external={true}
                  href="https://www.amsterdam.nl/wonen-leefomgeving/wonen/vakantieverhuur/melden"
                >
                  Vakantieverhuur melden
                </LinkdInline>
                .
              </p>
            </>
          )}
          {hasBothVerleend && (
            <Alert type="warning">
              <p>
                U hebt een vergunning voor vakantieverhuur én bed &amp;
                breakfast. Het is niet toegestaan om op hetzelfde adres zowel
                aan vakantieverhuur als bed &amp; breakfast te doen. U moet
                daarom 1 van deze vergunningen opzeggen.
                <LinkdInline
                  external={true}
                  href="https://www.amsterdam.nl/wonen-leefomgeving/wonen/vakantieverhuur/vergunning/"
                >
                  Meer informatie over voorwaarden vakantieverhuur
                </LinkdInline>
                .
              </p>
            </Alert>
          )}
          {!hasRegistrations && hasPermits && (
            <Alert type="warning">
              <p>
                U hebt een vergunning voor vakantieverhuur of bed &amp;
                breakfast. U moet daarom ook een landelijk registratienummer
                voor toeristische verhuur aanvragen.
                <LinkdInline
                  external={true}
                  href="https://www.amsterdam.nl/wonen-leefomgeving/wonen/registratienummer-toeristische-verhuur/"
                >
                  Meer informatie over het landelijk registratienummer
                  toeristische verhuur
                </LinkdInline>
                .
              </p>
            </Alert>
          )}
        </div>
      </PageContent>
      {hasVergunningenVakantieVerhuur && (
        <>
          <SectionCollapsible
            id="SectionCollapsible-planned-verhuur"
            title="Geplande verhuur"
            className={styles.SectionBorderTop}
            startCollapsed={isCollapsed('gepland')}
            hasItems={!!plannedVerhuur.length}
            noItemsMessage={
              is2021
                ? GEPLAND_DISCLAIMER
                : 'Er is geen geplande verhuur gevonden'
            }
            track={{
              category: 'Toeristische verhuur / Geplande Verhuur',
              name: 'Datatabel',
            }}
          >
            {is2021 && (
              <p className={styles.DisclaimerCollapseText}>
                {GEPLAND_DISCLAIMER}
              </p>
            )}
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
            noItemsMessage={
              is2021
                ? GEANNULEERD_DISCLAIMER
                : 'Er is geen geannuleerde verhuur gevonden'
            }
            track={{
              category: 'Toeristische verhuur / afgemeld Verhuur',
              name: 'Datatabel',
            }}
          >
            {is2021 && (
              <p className={styles.DisclaimerCollapseText}>
                {GEANNULEERD_DISCLAIMER}
              </p>
            )}
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
            noItemsMessage={
              is2021
                ? AFGEROND_DISCLAIMER
                : 'Er is geen afgelopen verhuur gevonden.'
            }
            startCollapsed={isCollapsed('previous')}
            hasItems={!!previousVerhuur.length}
            track={{
              category: 'Toeristische verhuur / afgelopen Verhuur',
              name: 'Datatabel',
            }}
          >
            {is2021 && (
              <p className={styles.DisclaimerCollapseText}>
                {AFGEROND_DISCLAIMER}
              </p>
            )}
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
        noItemsMessage={BB_VERGUNNING_DISCLAIMER}
        startCollapsed={isCollapsed('vergunningen')}
        track={{
          category: 'Toeristische verhuur / vergunningen',
          name: 'Datatabel',
        }}
      >
        {!hasVergunningBB && (
          <p className={styles.DisclaimerCollapseText}>
            {BB_VERGUNNING_DISCLAIMER}
          </p>
        )}
        {!!vergunningen?.length && (
          <Table
            className={styles.TableVergunningen}
            titleKey="title"
            displayProps={DISPLAY_PROPS_VERGUNNINGEN}
            items={vergunningen}
          />
        )}
      </SectionCollapsible>

      {hasRegistrations && (
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
                  {registrationItem.houseLetter}{' '}
                  {registrationItem.houseNumberExtension}{' '}
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
