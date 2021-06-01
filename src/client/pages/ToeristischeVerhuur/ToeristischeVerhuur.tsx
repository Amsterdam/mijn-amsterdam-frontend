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
import { ToeristischeVerhuurRegistratie } from '../../../server/services/toeristische-verhuur';

const DISPLAY_PROPS_VERHUUR = {
  dateRequest: 'Ontvangen op',
  dateStart: 'Start verhuur',
  dateEnd: 'Einde verhuur',
  duration: 'Aantal nachten',
};

const DISPLAY_PROPS_VERGUNNING_ACTUAL = {
  identifier: 'Huidige vergunning',
  dateStart: 'Vanaf',
  dateEnd: 'Tot',
  location: 'Adres',
};

const DISPLAY_PROPS_VERGUNNING_PREVIOUS = {
  identifier: 'Eerder vergunningen',
  dateStart: 'Vanaf',
  dateEnd: 'Tot',
  location: 'Adres',
};

export default function ToeristischeVerhuur() {
  const { TOERISTISCHE_VERHUUR } = useAppStateGetter();
  const { content } = TOERISTISCHE_VERHUUR;
  const verhuur = useMemo(() => {
    if (!content?.vergunningen?.length) {
      return [];
    }
    const items = content.vergunningen
      .filter(
        (vergunning) =>
          vergunning.caseType === 'Vakantieverhuur' ||
          vergunning.caseType === 'Vakantieverhuur afmelding'
      )
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
    return addTitleLinkComponent(items, 'dateRequest');
  }, [content?.vergunningen]);

  const vergunningen = useMemo(() => {
    if (!content?.vergunningen?.length) {
      return [];
    }
    const items = content.vergunningen
      .filter(
        (vergunning) =>
          vergunning.caseType === 'Vakantieverhuur vergunningsaanvraag' ||
          vergunning.caseType === 'B&B - vergunning'
      )
      .map((vergunning) => {
        return {
          ...vergunning,
          title:
            vergunning.title.length > 45
              ? vergunning.title.slice(0, 40) + '...'
              : vergunning.title,
          dateRequest: defaultDateFormat(vergunning.dateRequest),
          dateEnd: vergunning.dateEnd
            ? defaultDateFormat(vergunning.dateEnd)
            : null,
          dateStart: vergunning.dateStart
            ? defaultDateFormat(vergunning.dateStart)
            : null,
        };
      });
    return addTitleLinkComponent(items, 'identifier');
  }, [content?.vergunningen]);

  const actualVergunningen = useMemo(() => {
    return vergunningen?.filter(
      (vergunning) =>
        vergunning.caseType === 'Vakantieverhuur vergunningsaanvraag' &&
        vergunning.isActual
    );
  }, [vergunningen]);
  const BBActualVergunningen = useMemo(() => {
    return vergunningen?.filter(
      (vergunning) =>
        vergunning.caseType === 'B&B - vergunning' && vergunning.isActual
    );
  }, [vergunningen]);

  const previousVergunningen = useMemo(() => {
    return vergunningen?.filter(
      (vergunning) =>
        vergunning.caseType === 'Vakantieverhuur vergunningsaanvraag' &&
        !vergunning.isActual
    );
  }, [vergunningen]);

  const BBPreviousVergunningen = useMemo(() => {
    return vergunningen?.filter(
      (vergunning) =>
        vergunning.caseType === 'B&B - vergunning' && !vergunning.isActual
    );
  }, [vergunningen]);

  const cancelledVerhuur = useMemo(() => {
    return verhuur?.filter(
      (vergunning) => vergunning.caseType === 'Vakantieverhuur afmelding'
    );
  }, [verhuur]);

  const plannedVerhuur = useMemo(() => {
    return verhuur.filter(
      (vergunning) =>
        vergunning.caseType === 'Vakantieverhuur' && vergunning.isActual
    );
  }, [verhuur]);

  const previousVerhuur = useMemo(() => {
    return verhuur.filter(
      (vergunning) =>
        vergunning.caseType === 'Vakantieverhuur' && !vergunning.isActual
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
          Hieronder vindt u een overzicht van uw aanvragen voor toeristische
          verhuur.
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
            <LinkdInline
              external={true}
              href="https://www.amsterdam.nl/wonen-leefomgeving/wonen/vakantieverhuur/melden"
            >
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
        noItemsMessage="U heeft geen lopende aanvragen."
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
            className={styles.TableTop}
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
          hasItems={!!plannedVerhuur?.length}
          track={{
            category: 'Toeristische verhuur / Geplande Verhuur',
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
      {!!cancelledVerhuur.length && (
        <SectionCollapsible
          id="SectionCollapsible-cancled-verhuur"
          title={`Geanuleerde verhuur (${cancelledVerhuur.length})`}
          hasItems={!!cancelledVerhuur?.length}
          track={{
            category: 'Toeristische verhuur / afgemeld Verhuur',
            name: 'Datatabel',
          }}
        >
          <Table
            className={styles.Table}
            titleKey="dateRequest"
            displayProps={DISPLAY_PROPS_VERHUUR}
            items={cancelledVerhuur}
          />
        </SectionCollapsible>
      )}
      {!!previousVerhuur.length && (
        <SectionCollapsible
          id="SectionCollapsible-previous-verhuur"
          className={
            !BBActualVergunningen?.length ? styles.SectionNoBorderBottom : ''
          }
          title={`Afgelopen verhuur (${previousVerhuur?.length})`}
          noItemsMessage="U heeft geen lopende aanvragen."
          hasItems={!!previousVerhuur?.length}
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
      {(!!BBActualVergunningen.length || !!BBPreviousVergunningen.length) && (
        <SectionCollapsible
          id="SectionCollapsible-BBvergunning-aanvraag"
          title="Vergunning bed & breakfast"
          className={styles.SectionNoBorderBottom}
          noItemsMessage="U heeft geen lopende aanvragen."
          hasItems={
            !!BBActualVergunningen?.length || !!BBPreviousVergunningen.length
          }
          track={{
            category: 'Toeristische verhuur / Vergunning vakantieverhuur',
            name: 'Datatabel',
          }}
        >
          <Table
            className={styles.Table}
            titleKey="identifier"
            displayProps={DISPLAY_PROPS_VERGUNNING_ACTUAL}
            items={BBActualVergunningen}
          />
          {!!BBPreviousVergunningen.length && (
            <Table
              className={styles.TableTop}
              titleKey="identifier"
              displayProps={DISPLAY_PROPS_VERGUNNING_PREVIOUS}
              items={BBPreviousVergunningen}
            />
          )}
        </SectionCollapsible>
      )}
      <PageContent>
        <InfoDetail
          label="Registratienummer toeristische verhuur"
          value={content?.registraties?.map(
            (registrationItem: ToeristischeVerhuurRegistratie) => (
              <article
                key={registrationItem.registrationNumber}
                className={styles.RegistrationNumber}
              >
                {registrationItem.registrationNumber}
                <br />
                <>
                  {registrationItem.street} {registrationItem.houseNumber}
                  {registrationItem.houseLetter}
                  {registrationItem.houseNumberExtension}
                  {registrationItem.postalCode} {registrationItem.city}
                </>
              </article>
            )
          )}
        />
      </PageContent>
    </OverviewPage>
  );
}
