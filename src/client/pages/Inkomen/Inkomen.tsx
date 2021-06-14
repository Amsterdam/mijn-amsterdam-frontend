import classnames from 'classnames';
import { useMemo } from 'react';
import { generatePath } from 'react-router-dom';
import { FocusItem } from '../../../server/services/focus/focus-types';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { dateSort, isError, isLoading } from '../../../universal/helpers';
import { defaultDateFormat } from '../../../universal/helpers/date';
import {
  addTitleLinkComponent,
  Alert,
  ChapterIcon,
  Linkd,
  OverviewPage,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
  MaintenanceNotifications,
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
    type: 'uitkering',
  }
);

export const incomSpecificationsRouteYearly = generatePath(
  AppRoutes['INKOMEN/SPECIFICATIES'],
  {
    type: 'jaaropgave',
  }
);

const requestsDisplayProps = {
  displayDateStart: 'Datum aanvraag',
  status: 'Status',
};

const decisionsDisplayProps = {
  displayDateStart: 'Datum aanvraag',
  displayDatePublished: 'Datum besluit',
};

export default function Inkomen() {
  const { FOCUS_AANVRAGEN, FOCUS_SPECIFICATIES, FOCUS_TOZO, FOCUS_TONK } =
    useAppStateGetter();

  const focusSpecificatiesWithDocumentLinks =
    useAddDocumentLinkComponents(FOCUS_SPECIFICATIES);
  const aanvragen = FOCUS_AANVRAGEN.content;
  const tozoItems = FOCUS_TOZO.content;
  const tonkItems = FOCUS_TONK.content;
  const uitkeringsspecificaties =
    focusSpecificatiesWithDocumentLinks.content?.uitkeringsspecificaties;
  const jaaropgaven = focusSpecificatiesWithDocumentLinks.content?.jaaropgaven;

  const items: FocusItem[] = useMemo(() => {
    if ((!aanvragen && !tozoItems) || !tonkItems) {
      return [];
    }

    return addTitleLinkComponent(
      [...(aanvragen || []), ...(tozoItems || []), ...(tonkItems || [])]
        .filter((item) => item.productTitle !== 'Stadspas')
        .map((item) => {
          return Object.assign({}, item, {
            displayDatePublished: defaultDateFormat(item.datePublished),
            displayDateStart: defaultDateFormat(item.dateStart),
          });
        })
        .sort(dateSort('datePublished', 'desc'))
    );
  }, [aanvragen, tozoItems, tonkItems]);

  const itemsRequested = items.filter((item) => item.status !== 'Besluit');
  const itemsDecided = items.filter((item) => item.status === 'Besluit');

  const hasActiveRequests = !!itemsRequested.length;
  const hasActiveDescisions = !!itemsDecided.length;

  const itemsSpecificationsMonthly = uitkeringsspecificaties?.slice(0, 3);
  const itemsSpecificationsYearly = jaaropgaven?.slice(0, 3);

  const isLoadingFocus =
    isLoading(FOCUS_AANVRAGEN) ||
    isLoading(FOCUS_TOZO) ||
    isLoading(FOCUS_TONK);
  const isLoadingFocusSpecificaties = isLoading(FOCUS_SPECIFICATIES);

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
        {(isError(FOCUS_AANVRAGEN) ||
          isError(FOCUS_SPECIFICATIES) ||
          isError(FOCUS_TOZO) ||
          isError(FOCUS_TONK)) && (
          <Alert type="warning">
            <p>We kunnen op dit moment niet alle gegevens tonen.</p>
          </Alert>
        )}
      </PageContent>

      <SectionCollapsible
        id="SectionCollapsible-income-request-process"
        title="Lopende aanvragen"
        startCollapsed={false}
        isLoading={isLoadingFocus}
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
        isLoading={isLoadingFocus}
        hasItems={hasActiveDescisions}
        title="Eerdere aanvragen"
        track={{
          category: 'Inkomen overzicht / Eerdere aanvragen',
          name: 'Datatabel',
        }}
        noItemsMessage="U hebt op dit moment geen eerdere aanvragen."
      >
        <Table
          items={itemsDecided}
          displayProps={decisionsDisplayProps}
          className={styles.Table}
        />
      </SectionCollapsible>

      <SectionCollapsible
        id="SectionCollapsible-income-specifications-monthly"
        startCollapsed={true}
        isLoading={isLoadingFocusSpecificaties}
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
        isLoading={isLoadingFocus}
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
