import classnames from 'classnames';
import { useMemo } from 'react';
import { generatePath } from 'react-router-dom';
import { REQUEST_PROCESS_COMPLETED_STATUS_IDS } from '../../../server/services/wpi/config';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { dateSort, isError, isLoading } from '../../../universal/helpers';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { StatusLine } from '../../../universal/types';
import {
  addTitleLinkComponent,
  Alert,
  ChapterIcon,
  Linkd,
  MaintenanceNotifications,
  OverviewPage,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
} from '../../components';
import { ExternalUrls } from '../../config/app';
import { useAppStateGetter } from '../../hooks/useAppState';
import {
  annualStatementsTableDisplayProps,
  specificationsTableDisplayProps,
} from '../../pages/InkomenSpecificaties/InkomenSpecificaties';
import specicationsStyles from '../InkomenSpecificaties/InkomenSpecificaties.module.scss';
import { useAddDocumentLinkComponents } from '../InkomenSpecificaties/useAddDocumentLinks';
import styles from './Inkomen.module.scss';

export const incomSpecificationsRouteMonthly = generatePath(
  AppRoutes['INKOMEN/SPECIFICATIES'],
  {
    variant: 'uitkering',
  }
);

export const incomSpecificationsRouteYearly = generatePath(
  AppRoutes['INKOMEN/SPECIFICATIES'],
  {
    variant: 'jaaropgave',
  }
);

const requestsDisplayProps = {
  displayDateStart: 'Datum aanvraag',
  status: 'Status',
};

const decisionsDisplayProps = {
  displayDateStart: 'Datum aanvraag',
  displayDateEnd: 'Datum besluit',
};

export default function Inkomen() {
  const { WPI_AANVRAGEN, WPI_SPECIFICATIES, WPI_TOZO, WPI_TONK, WPI_BBZ } =
    useAppStateGetter();

  const wpiSpecificatiesWithDocumentLinks =
    useAddDocumentLinkComponents(WPI_SPECIFICATIES);
  const aanvragen = WPI_AANVRAGEN.content;
  const tozoItems = WPI_TOZO.content;
  const tonkItems = WPI_TONK.content;
  const bbzItems = WPI_BBZ.content;
  const uitkeringsspecificaties =
    wpiSpecificatiesWithDocumentLinks.content?.uitkeringsspecificaties;
  const jaaropgaven = wpiSpecificatiesWithDocumentLinks.content?.jaaropgaven;
  const items: StatusLine[] = useMemo(() => {
    if ((!aanvragen && !tozoItems) || !tonkItems) {
      return [];
    }

    const items = [
      ...(aanvragen || []),
      ...(tozoItems || []),
      ...(tonkItems || []),
      ...(bbzItems || []),
    ]
      .map((item) => {
        const isBbzHistoric = item.about === 'Bbz' && item.steps.some(step => step.id === "besluit");
        const activeStatusStep =
          // Bbz steps are sorted in reverse because of a Business decision, unknown rationale
          isBbzHistoric ? item.steps[0] : item.steps[item.steps.length - 1];
        return Object.assign({}, item, {
          displayDateEnd: isBbzHistoric
            ? '-'
            : defaultDateFormat(item.dateEnd || item.datePublished),
          displayDateStart: isBbzHistoric ? '-' : defaultDateFormat(item.dateStart),
          status: isBbzHistoric
            ? '-'
            : activeStatusStep?.status.replace(/-\s/g, '') || '', // Compensate for pre-broken words like Terugvorderings- besluit.
        });
      })
      .sort(dateSort('datePublished', 'desc'));

    return addTitleLinkComponent(items);
  }, [aanvragen, tozoItems, tonkItems, bbzItems]);

  // Determine the completed requests
  const itemsCompleted = items.filter((item) => {
    return REQUEST_PROCESS_COMPLETED_STATUS_IDS.includes(item.statusId);
  });
  // Active requests are not present in completed requests
  const itemsRequested = items.filter(
    (item) =>
      !itemsCompleted.some((itemCompleted) => item.id === itemCompleted.id)
  );
  const hasActiveRequests = !!itemsRequested.length;
  const hasActiveDescisions = !!itemsCompleted.length;

  const itemsSpecificationsMonthly = uitkeringsspecificaties?.slice(0, 3);
  const itemsSpecificationsYearly = jaaropgaven?.slice(0, 3);

  const isLoadingWpi =
    isLoading(WPI_AANVRAGEN) ||
    isLoading(WPI_TOZO) ||
    isLoading(WPI_TONK) ||
    isLoading(WPI_BBZ);

  const isLoadingWpiSpecificaties = isLoading(WPI_SPECIFICATIES);

  return (
    <OverviewPage className={styles.Inkomen}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        isLoading={false}
        icon={<ChapterIcon />}
      >
        {ChapterTitles.INKOMEN}
      </PageHeading>
      <PageContent>
        <p>
          Op deze pagina vindt u informatie over uw uitkering en de
          ondersteuning die u krijgt omdat u weinig geld hebt.
        </p>
        <p>
          <Linkd external={true} href={ExternalUrls.WPI_ALGEMEEN}>
            Algemene informatie over Werk en Inkomen
          </Linkd>
          <br />
          <Linkd external={true} href={ExternalUrls.WPI_CONTACT}>
            Contact Werk en Inkomen
          </Linkd>
        </p>
        <MaintenanceNotifications page="inkomen" />
        {(isError(WPI_AANVRAGEN) ||
          isError(WPI_SPECIFICATIES) ||
          isError(WPI_TOZO) ||
          isError(WPI_TONK)) && (
          <Alert type="warning">
            <p>We kunnen op dit moment niet alle gegevens tonen.</p>
          </Alert>
        )}
      </PageContent>

      <SectionCollapsible
        id="SectionCollapsible-income-request-process"
        title="Lopende aanvragen"
        startCollapsed={false}
        isLoading={isLoadingWpi}
        hasItems={hasActiveRequests}
        track={{
          category: 'Inkomen overzicht / Lopende aanvragen',
          name: 'Datatabel',
        }}
        noItemsMessage="U hebt op dit moment geen lopende aanvragen."
        className={styles.SectionCollapsible}
      >
        <Table
          items={itemsRequested}
          displayProps={requestsDisplayProps}
          className={styles.Table}
        />
      </SectionCollapsible>

      <SectionCollapsible
        id="SectionCollapsible-income-request-process-decisions"
        startCollapsed={true}
        isLoading={isLoadingWpi}
        hasItems={hasActiveDescisions}
        title="Eerdere aanvragen"
        track={{
          category: 'Inkomen overzicht / Eerdere aanvragen',
          name: 'Datatabel',
        }}
        noItemsMessage="U hebt op dit moment geen eerdere aanvragen."
      >
        <Table
          items={itemsCompleted}
          displayProps={decisionsDisplayProps}
          className={styles.Table}
        />
      </SectionCollapsible>

      <SectionCollapsible
        id="SectionCollapsible-income-specifications-monthly"
        startCollapsed={true}
        isLoading={isLoadingWpiSpecificaties}
        title="Uitkeringsspecificaties"
        hasItems={!!uitkeringsspecificaties?.length}
        track={{
          category: 'Inkomen overzicht / Uitkeringsspecificaties',
          name: 'Datatabel',
        }}
        noItemsMessage="Er zijn op dit moment geen uitkeringsspecificaties."
      >
        {itemsSpecificationsMonthly && (
          <Table
            className={specicationsStyles.SpecificationsTable}
            items={itemsSpecificationsMonthly}
            displayProps={specificationsTableDisplayProps}
          />
        )}
        {uitkeringsspecificaties?.length && uitkeringsspecificaties.length > 3 && (
          <p className={styles.ShowAllButtonContainer}>
            <Linkd href={incomSpecificationsRouteMonthly}>Toon alles</Linkd>
          </p>
        )}
      </SectionCollapsible>

      <SectionCollapsible
        id="SectionCollapsible-income-specifications-yearly"
        startCollapsed={true}
        isLoading={isLoadingWpi}
        title="Jaaropgaven"
        hasItems={!!jaaropgaven?.length}
        track={{
          category: 'Inkomen overzicht / Jaaropgaven',
          name: 'Datatabel',
        }}
        noItemsMessage="Er zijn op dit moment geen jaaropgaven."
      >
        {itemsSpecificationsYearly && (
          <Table
            className={classnames(
              specicationsStyles.SpecificationsTable,
              specicationsStyles['SpecificationsTable--annualStatements']
            )}
            items={itemsSpecificationsYearly}
            displayProps={annualStatementsTableDisplayProps}
          />
        )}
        {jaaropgaven?.length && jaaropgaven.length > 3 && (
          <p className={styles.ShowAllButtonContainer}>
            <Linkd href={incomSpecificationsRouteYearly}>Toon alles</Linkd>
          </p>
        )}
      </SectionCollapsible>
    </OverviewPage>
  );
}
