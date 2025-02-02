import { useMemo } from 'react';

import { LinkList, Paragraph } from '@amsterdam/design-system-react';
import classnames from 'classnames';
import { generatePath } from 'react-router-dom';

import styles from './Inkomen.module.scss';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { dateSort, defaultDateFormat } from '../../../universal/helpers/date';
import {
  ErrorAlert,
  MaintenanceNotifications,
  SectionCollapsible,
  Table,
  addTitleLinkComponent,
} from '../../components';
import { MaRouterLink } from '../../components/MaLink/MaLink';
import {
  OverviewPageV2,
  PageContentCell,
  PageContentV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';
import { ExternalUrls, MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';
import {
  annualStatementsTableDisplayProps,
  specificationsTableDisplayProps,
} from '../../pages/InkomenSpecificaties/InkomenSpecificaties';
import specicationsStyles from '../InkomenSpecificaties/InkomenSpecificaties.module.scss';
import { useAddDocumentLinkComponents } from '../InkomenSpecificaties/useAddDocumentLinks';

export const REQUEST_PROCESS_COMPLETED_STATUS_IDS = [
  'besluit',
  'intrekking',
  'briefWeigering',
  'terugvorderingsbesluit',
];

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
  const items = useMemo(() => {
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
        const isBbz = item.about === 'Bbz';
        const isBbzHistoric =
          isBbz && item.steps.some((step) => step.id === 'besluit');
        const activeStatusStep = item.steps[item.steps.length - 1];
        return Object.assign({}, item, {
          displayDateEnd: defaultDateFormat(item.dateEnd || item.datePublished),
          displayDateStart: isBbzHistoric
            ? defaultDateFormat(
                item.steps.find((s) => s.id === 'aanvraag')?.datePublished ||
                  item.dateStart
              )
            : defaultDateFormat(item.dateStart),
          status: isBbzHistoric
            ? '-'
            : isBbz
              ? 'In behandeling'
              : activeStatusStep?.status.replace(/-\s/g, '') || '', // Compensate for pre-broken words like Terugvorderings- besluit.
        });
      })
      .sort(dateSort('datePublished', 'desc'));

    return addTitleLinkComponent(items);
  }, [aanvragen, tozoItems, tonkItems, bbzItems]);

  // Determine the completed requests
  const itemsCompleted = items.filter((item) => {
    return item.steps.some((step) =>
      REQUEST_PROCESS_COMPLETED_STATUS_IDS.includes(step.id)
    );
  });
  // Active requests are not present in completed requests
  const itemsRequested = items.filter(
    (item) =>
      !itemsCompleted.some((itemCompleted) => item.id === itemCompleted.id)
  );
  const hasActiveRequests = !!itemsRequested.length;
  const hasActiveDescisions = !!itemsCompleted.length;

  const itemsSpecificationsMonthly = uitkeringsspecificaties?.slice(
    0,
    MAX_TABLE_ROWS_ON_THEMA_PAGINA
  );
  const itemsSpecificationsYearly = jaaropgaven?.slice(
    0,
    MAX_TABLE_ROWS_ON_THEMA_PAGINA
  );

  const isLoadingWpi =
    isLoading(WPI_AANVRAGEN) ||
    isLoading(WPI_TOZO) ||
    isLoading(WPI_TONK) ||
    isLoading(WPI_BBZ);

  const isLoadingWpiSpecificaties = isLoading(WPI_SPECIFICATIES);

  return (
    <OverviewPageV2>
      <PageContentV2>
        <PageHeadingV2 backLink={AppRoutes.HOME}>
          {ThemaTitles.INKOMEN}
        </PageHeadingV2>
        <PageContentCell spanWide={6}>
          <Paragraph className="ams-mb--sm">
            Op deze pagina vindt u informatie over uw uitkering en de
            ondersteuning die u krijgt omdat u weinig geld hebt.
          </Paragraph>
          <LinkList className="ams-mb--xl">
            <LinkList.Link href={ExternalUrls.WPI_ALGEMEEN}>
              Algemene informatie over Werk en Inkomen
            </LinkList.Link>
            <LinkList.Link href={ExternalUrls.WPI_CONTACT}>
              Contact Werk en Inkomen
            </LinkList.Link>
          </LinkList>
          <MaintenanceNotifications page="inkomen" />
          {(isError(WPI_AANVRAGEN) ||
            isError(WPI_SPECIFICATIES) ||
            isError(WPI_TOZO) ||
            isError(WPI_TONK)) && (
            <ErrorAlert>
              We kunnen op dit moment niet alle gegevens tonen.
            </ErrorAlert>
          )}
        </PageContentCell>
      </PageContentV2>

      <SectionCollapsible
        id="SectionCollapsible-income-request-process"
        title="Lopende aanvragen"
        startCollapsed={false}
        isLoading={isLoadingWpi}
        hasItems={hasActiveRequests}
        noItemsMessage="U heeft op dit moment geen lopende aanvragen."
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
        noItemsMessage="U heeft op dit moment geen eerdere aanvragen."
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
        noItemsMessage="Er zijn op dit moment geen uitkeringsspecificaties."
      >
        {itemsSpecificationsMonthly && (
          <Table
            className={specicationsStyles.SpecificationsTable}
            items={itemsSpecificationsMonthly}
            displayProps={specificationsTableDisplayProps}
          />
        )}
        {uitkeringsspecificaties?.length &&
          uitkeringsspecificaties.length > MAX_TABLE_ROWS_ON_THEMA_PAGINA && (
            <Paragraph className={styles.ShowAllButtonContainer}>
              <MaRouterLink href={incomSpecificationsRouteMonthly}>
                Toon alles
              </MaRouterLink>
            </Paragraph>
          )}
      </SectionCollapsible>

      <SectionCollapsible
        id="SectionCollapsible-income-specifications-yearly"
        startCollapsed={true}
        isLoading={isLoadingWpi}
        title="Jaaropgaven"
        hasItems={!!jaaropgaven?.length}
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
        {jaaropgaven?.length &&
          jaaropgaven.length > MAX_TABLE_ROWS_ON_THEMA_PAGINA && (
            <Paragraph className={styles.ShowAllButtonContainer}>
              <MaRouterLink href={incomSpecificationsRouteYearly}>
                Toon alles
              </MaRouterLink>
            </Paragraph>
          )}
      </SectionCollapsible>
    </OverviewPageV2>
  );
}
