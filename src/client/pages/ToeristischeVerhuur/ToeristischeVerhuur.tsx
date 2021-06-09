import React, { useMemo } from 'react';

import { ToeristischeVerhuurRegistratie } from '../../../server/services/toeristische-verhuur';
import { AppRoutes, ChapterTitles } from '../../../universal/config/index';
import { dateSort, defaultDateFormat } from '../../../universal/helpers';
import {
  addTitleLinkComponent,
  ChapterIcon,
  Heading,
  InfoDetail,
  Linkd,
  LinkdInline,
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

export default function ToeristischeVerhuur() {
  const { TOERISTISCHE_VERHUUR } = useAppStateGetter();
  const { content } = TOERISTISCHE_VERHUUR;

  const verhuur = useMemo(() => {
    if (!content?.vergunningen?.length) {
      return [];
    }
    const items = content.vergunningen
      .filter((vergunning) => vergunning.caseType === 'Vakantieverhuur')
      .sort(dateSort('dateStart', 'asc'))
      .map((vergunning) => {
        return {
          ...vergunning,
          dateRequest: defaultDateFormat(vergunning.dateRequest),
          dateEnd: vergunning.dateEnd
            ? defaultDateFormat(vergunning.dateEnd)
            : null,
          dateStart: vergunning.dateStart
            ? defaultDateFormat(vergunning.dateStart)
            : null,
        };
      });
    return addTitleLinkComponent(items, 'dateStart');
  }, [content?.vergunningen]);

  const vergunningenActual = useMemo(() => {
    if (!content?.vergunningen?.length) {
      return [];
    }
    return content.vergunningen.filter(
      (vergunning) =>
        ['Vergunning bed & breakfast', 'Vergunning vakantieverhuur'].includes(
          vergunning.title
        ) && vergunning.isActual
    );
  }, [content?.vergunningen]);

  const vergunningenVakantieVerhuur = useMemo(() => {
    return vergunningenActual.filter(
      (vergunning) =>
        vergunning.caseType === 'Vakantieverhuur vergunningsaanvraag'
    );
  }, [vergunningenActual]);

  const vergunningenBB = useMemo(() => {
    return vergunningenActual.filter(
      (vergunning) => vergunning.caseType === 'B&B - vergunning'
    );
  }, [vergunningenActual]);

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
      default:
        return false;
    }
  };

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
        {!vergunningenBB.length && (
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
        )}
        {!vergunningenVakantieVerhuur.length && !!vergunningenBB.length && (
          <p>
            <Linkd
              external={true}
              href="https://www.amsterdam.nl/wonen-leefomgeving/wonen/bedandbreakfast/"
            >
              Meer informatie over bed and breakfast
            </Linkd>
            <br />
            <Linkd
              external={true}
              href="https://www.amsterdam.nl/wonen-leefomgeving/wonen/bedandbreakfast/regels/"
            >
              Regels bed and breakfast
            </Linkd>
          </p>
        )}
        <div className={styles.Detail}>
          {!!vergunningenVakantieVerhuur.length && (
            <>
              <Heading el="h3" size="tiny" className={styles.InvertedLabel}>
                U heeft nog {content?.daysLeft ?? 30} dagen dat u uw woning mag
                verhuren.
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
          {!!vergunningenActual.length && (
            <p>
              {vergunningenActual.map((vergunning) => (
                <React.Fragment key={vergunning.identifier}>
                  <Linkd href={vergunning.link.to}>
                    {vergunning.title} ({vergunning.status})
                  </Linkd>
                  <br />
                </React.Fragment>
              ))}
            </p>
          )}
        </div>
      </PageContent>
      {!!content?.registraties.length && (
        <>
          <SectionCollapsible
            id="SectionCollapsible-planned-verhuur"
            title="Geplande verhuur"
            className={styles.SectionBorderTop}
            startCollapsed={false}
            noItemsMessage="U heeft dit jaar nog geen geplande verhuur"
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

          {!!cancelledVerhuur.length && (
            <SectionCollapsible
              id="SectionCollapsible-cancled-verhuur"
              title="Geannuleerde verhuur"
              startCollapsed={isCollapsed('geannuleerd')}
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
          )}
          {!!previousVerhuur.length && (
            <SectionCollapsible
              id="SectionCollapsible-previous-verhuur"
              className={styles.SectionNoBorderBottom}
              title="Afgelopen verhuur"
              startCollapsed={isCollapsed('previous')}
              track={{
                category: 'Toeristische verhuur / afgemeld Verhuur',
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
          )}
        </>
      )}
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
