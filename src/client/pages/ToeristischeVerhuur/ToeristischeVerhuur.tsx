import { useMemo } from 'react';
import type { ToeristischeVerhuurRegistratieDetail } from '../../../server/services/toeristische-verhuur';
import { AppRoutes, ChapterTitles } from '../../../universal/config/index';
import {
  defaultDateFormat,
  isError,
  isLoading,
} from '../../../universal/helpers';
import {
  addTitleLinkComponent,
  ErrorAlert,
  ChapterIcon,
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

const DISPLAY_PROPS_VERGUNNINGEN = {
  title: 'Soort vergunning',
  status: 'Status',
  dateStart: 'Vanaf',
  dateEnd: 'Tot',
};

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

  const vergunningen = useMemo(() => {
    if (!content?.vergunningen?.length) {
      return [];
    }

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
      }
    }

    return addTitleLinkComponent(vergunningen, 'title');
  }, [content?.vergunningen]);

  const actieveVergunningen = vergunningen.filter((vergunning) => {
    const vergunningEndDate = vergunning.dateEnd
      ? new Date(vergunning.dateEnd)
      : null;
    const today = new Date();

    return (
      vergunning.status === 'Ontvangen' ||
      (vergunning.status === 'Verleend' &&
        vergunningEndDate &&
        vergunningEndDate > today)
    );
  });

  const inactieveVergunningen = vergunningen.filter(
    (v) => !actieveVergunningen.includes(v)
  );

  const hasRegistrations = !!content?.registraties.length;
  const hasPermits = hasVergunningenVakantieVerhuur || hasVergunningBB;
  const hasBothPermits = hasVergunningenVakantieVerhuur && hasVergunningBB;
  const hasBothVerleend =
    hasVergunningenVakantieVerhuurVerleend && hasVergunningBBVerleend;

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
          Hieronder vindt u een overzicht van uw vergunningen voor toeristische
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
            href="https://www.amsterdam.nl/veelgevraagd/toeristenbelasting-2c7c2"
          >
            Meer over toeristenbelasting
          </Linkd>

          <Linkd
            external={true}
            href="https://www.toeristischeverhuur.nl/portaal/login"
          >
            Vakantieverhuur melden of registratienummer aanvragen
          </Linkd>

          <MaintenanceNotifications page="toeristische-verhuur" />
        </p>
        {isError(TOERISTISCHE_VERHUUR) && (
          <ErrorAlert>
            We kunnen op dit moment niet alle gegevens tonen.
          </ErrorAlert>
        )}
        <div className={styles.Detail}>
          {hasBothVerleend && (
            <ErrorAlert>
              U hebt een vergunning voor vakantieverhuur én bed &amp; breakfast.
              Het is niet toegestaan om op hetzelfde adres zowel aan
              vakantieverhuur als bed &amp; breakfast te doen. U moet daarom 1
              van deze vergunningen opzeggen.
              <LinkdInline
                external={true}
                href="https://www.amsterdam.nl/wonen-leefomgeving/wonen/vakantieverhuur/vergunning/"
              >
                Meer informatie over voorwaarden vakantieverhuur
              </LinkdInline>
              .
            </ErrorAlert>
          )}
          {!hasRegistrations && hasPermits && (
            <ErrorAlert>
              U hebt een vergunning voor vakantieverhuur of bed &amp; breakfast.
              U moet daarom ook een landelijk registratienummer voor
              toeristische verhuur aanvragen.
              <LinkdInline
                external={true}
                href="https://www.amsterdam.nl/wonen-leefomgeving/wonen/registratienummer-toeristische-verhuur/"
              >
                Meer informatie over het landelijk registratienummer
                toeristische verhuur
              </LinkdInline>
              .
            </ErrorAlert>
          )}
        </div>
      </PageContent>

      <SectionCollapsible
        id="SectionCollapsible-vergunningen"
        className={styles.SectionNoBorderBottom}
        title="Huidige vergunningen"
        hasItems={!!actieveVergunningen.length}
        noItemsMessage={BB_VERGUNNING_DISCLAIMER}
        isLoading={isLoading(TOERISTISCHE_VERHUUR)}
        startCollapsed={false}
      >
        {!hasVergunningBB && (
          <p className={styles.DisclaimerCollapseText}>
            {BB_VERGUNNING_DISCLAIMER}
          </p>
        )}
        {!!actieveVergunningen?.length && (
          <Table
            className={styles.TableVergunningen}
            titleKey="title"
            displayProps={DISPLAY_PROPS_VERGUNNINGEN}
            items={actieveVergunningen}
          />
        )}
      </SectionCollapsible>

      <SectionCollapsible
        id="SectionCollapsible-vergunningen"
        className={styles.SectionNoBorderBottom}
        title="Eerdere vergunningen"
        hasItems={!!inactieveVergunningen.length}
        noItemsMessage={BB_VERGUNNING_DISCLAIMER}
        isLoading={isLoading(TOERISTISCHE_VERHUUR)}
        startCollapsed={false}
      >
        {!hasVergunningBB && (
          <p className={styles.DisclaimerCollapseText}>
            {BB_VERGUNNING_DISCLAIMER}
          </p>
        )}
        {!!inactieveVergunningen?.length && (
          <Table
            className={styles.TableVergunningen}
            titleKey="title"
            displayProps={DISPLAY_PROPS_VERGUNNINGEN}
            items={inactieveVergunningen}
          />
        )}
      </SectionCollapsible>

      {hasRegistrations && (
        <PageContent>
          <InfoDetail
            label="Registratienummer toeristische verhuur"
            valueWrapperElement="div"
            value={content?.registraties?.map(
              (registrationItem: ToeristischeVerhuurRegistratieDetail) => (
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
