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
import { useProfileTypeValue } from '../../hooks/useProfileType';
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

export default function ToeristischeVerhuur() {
  const { TOERISTISCHE_VERHUUR } = useAppStateGetter();
  const { content } = TOERISTISCHE_VERHUUR;
  const profileType = useProfileTypeValue();

  const hasVergunningenVakantieVerhuur = useMemo(() => {
    return content?.vergunningen.some(
      (vergunning) => vergunning.title === 'Vergunning vakantieverhuur'
    );
  }, [content?.vergunningen]);

  const hasVergunningBB = useMemo(() => {
    return content?.vergunningen.some(
      (vergunning) => vergunning.title === 'Vergunning bed & breakfast'
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
  const hasRegistrations = !!content?.registraties.length;
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
                    U heeft nog {daysRemaining} nachten dat u uw woning mag
                    verhuren.
                  </>
                )}
              </Heading>
              {getYear(new Date()) === 2021 ? (
                <p className={styles.DetailText}>
                  Het aantal resterende nachten is gebaseerd op meldingen voor
                  ingeplande en afgelopen verhuur die u
                  <strong> vanaf 19 juli</strong> 2021 hebt ingediend. Meldingen
                  die u voor 19 juli hebt ingediend zijn mogelijk niet geheel
                  meegenomen bij deze berekening. Dit is ook zonder eventuele
                  meldingen die dit jaar door een mede-verhuurder of vorige
                  bewoner zijn gedaan.
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
          {hasBothPermits && (
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
            startCollapsed={false}
            hasItems={!!plannedVerhuur.length}
            noItemsMessage="Er is geen geplande verhuur gevonden."
            track={{
              category: 'Toeristische verhuur / Geplande Verhuur',
              name: 'Datatabel',
            }}
          >
            <p className={styles.DisclaimerCollapseText}>
              U ziet hieronder alleen meldingen die vanaf 4 juli zijn ingepland.
              Meldingen die u vóór 4 juli hebt ingepland kunnen niet worden
              getoond.
            </p>
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
            noItemsMessage="U ziet hieronder alleen meldingen die vanaf 14 juli zijn
            geannuleerd. Meldingen die u vóór 14 juli hebt geannuleerd kunnen
            niet worden getoond."
            track={{
              category: 'Toeristische verhuur / afgemeld Verhuur',
              name: 'Datatabel',
            }}
          >
            <p className={styles.DisclaimerCollapseText}>
              U ziet hieronder alleen meldingen die vanaf 14 juli zijn
              geannuleerd. Meldingen die u vóór 14 juli hebt geannuleerd kunnen
              niet worden getoond.
            </p>
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
            noItemsMessage="U ziet hieronder alleen meldingen die na 4 juli zijn afgerond.
            Meldingen die vóór 4 juli zijn afgerond kunnen niet worden
            getoond."
            startCollapsed={isCollapsed('previous')}
            hasItems={!!previousVerhuur.length}
            track={{
              category: 'Toeristische verhuur / afgelopen Verhuur',
              name: 'Datatabel',
            }}
          >
            <p className={styles.DisclaimerCollapseText}>
              U ziet hieronder alleen meldingen die na 4 juli zijn afgerond.
              Meldingen die vóór 4 juli zijn afgerond kunnen niet worden
              getoond.
            </p>
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
        noItemsMessage="U ziet hieronder alleen vergunningen die vanaf 1 april zijn toegekend. Vergunningen die u vóór 1 april hebt aangevraagd kunnen niet worden getoond."
        startCollapsed={profileType !== 'commercial'}
        track={{
          category: 'Toeristische verhuur / vergunningen',
          name: 'Datatabel',
        }}
      >
        <p className={styles.DisclaimerCollapseText}>
          U ziet hieronder alleen vergunningen die vanaf 1 april zijn toegekend.
          Vergunningen die u vóór 1 april hebt aangevraagd kunnen niet worden
          getoond.
        </p>
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
