import classnames from 'classnames';
import React, { useContext, useMemo } from 'react';
import { generatePath } from 'react-router-dom';
import {
  AppRoutes,
  ChapterTitles,
  FeatureToggle,
} from '../../../universal/config';
import { dateSort, isError, isLoading } from '../../../universal/helpers';
import { AppContext } from '../../AppState';
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
} from '../../components';
import { ExternalUrls } from '../../config/app';
import {
  annualStatementsTableDisplayProps,
  specificationsTableDisplayProps,
} from '../../pages/InkomenSpecificaties/InkomenSpecificaties';
import specicationsStyles from '../InkomenSpecificaties/InkomenSpecificaties.module.scss';
import styles from './Inkomen.module.scss';
import { defaultDateFormat } from '../../../universal/helpers/date';

export const incomSpecificationsRouteMonthly = generatePath(
  AppRoutes['INKOMEN/SPECIFICATIES']
);
export const incomSpecificationsRouteYearly = generatePath(
  AppRoutes['INKOMEN/SPECIFICATIES'],
  {
    type: 'jaaropgaven',
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

export default () => {
  const { FOCUS_AANVRAGEN, FOCUS_SPECIFICATIES, FOCUS_TOZO } = useContext(
    AppContext
  );
  const aanvragen = FOCUS_AANVRAGEN.content || [];
  const tozoItems = FOCUS_TOZO.content || [];
  const uitkeringsspecificaties =
    FOCUS_SPECIFICATIES.content?.uitkeringsspecificaties || [];
  const jaaropgaven = FOCUS_SPECIFICATIES.content?.jaaropgaven || [];

  const itemsRequested = useMemo(() => {
    const itemsRequested = aanvragen.filter(item =>
      item.steps.every(step => step.title !== 'beslissing')
    );

    if (tozoItems.length && FeatureToggle.tozoActive) {
      itemsRequested.push(
        ...tozoItems.filter(tozoItem => tozoItem.status !== 'Besluit')
      );
    }

    return addTitleLinkComponent(
      itemsRequested
        .map(item =>
          Object.assign(item, {
            displayDatePublished: defaultDateFormat(item.datePublished),
            displayDateStart: defaultDateFormat(item.dateStart),
          })
        )
        .sort(dateSort('datePublished', 'desc'))
    );
  }, [aanvragen, tozoItems]);

  const itemsDecided = useMemo(() => {
    const itemsDecided = aanvragen.filter(item =>
      item.steps.some(step => step.title === 'beslissing')
    );

    if (tozoItems.length && FeatureToggle.tozoActive) {
      itemsDecided.push(
        ...tozoItems.filter(tozoItem => tozoItem.status === 'Besluit')
      );
    }

    return addTitleLinkComponent(
      itemsDecided
        .map(item =>
          Object.assign(item, {
            displayDatePublished: defaultDateFormat(item.datePublished),
            displayDateStart: defaultDateFormat(item.dateStart),
          })
        )
        .sort(dateSort('datePublished', 'desc'))
    );
  }, [aanvragen, tozoItems]);

  const hasActiveRequests = !!itemsRequested.length;
  const hasActiveDescisions = !!itemsDecided.length;

  const itemsSpecificationsMonthly = uitkeringsspecificaties.slice(0, 3) || [];
  const itemsSpecificationsYearly = jaaropgaven.slice(0, 3) || [];

  const isLoadingFocus = isLoading(FOCUS_AANVRAGEN) || isLoading(FOCUS_TOZO);
  const isLoadingFocusSpecificaties = isLoading(FOCUS_SPECIFICATIES);

  return (
    <OverviewPage className={styles.Inkomen}>
      <PageHeading icon={<ChapterIcon />}>{ChapterTitles.INKOMEN}</PageHeading>
      <PageContent>
        <p>
          Op deze pagina vindt u informatie over uw uitkering en de
          ondersteuning die u krijgt omdat u weinig geld hebt.
        </p>
        <p>
          <Linkd external={true} href={ExternalUrls.WPI_ALGEMEEN}>
            Algemene informatie over werk en inkomen
          </Linkd>
          <br />
          <Linkd external={true} href={ExternalUrls.WPI_CONTACT}>
            Contact Inkomen en Stadspas
          </Linkd>
        </p>
        {(isError(FOCUS_AANVRAGEN) ||
          isError(FOCUS_SPECIFICATIES) ||
          isError(FOCUS_TOZO)) && (
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
          category: 'Inkomen en Stadspas overzicht / Lopende aanvragen',
          name: 'Datatabel',
        }}
        noItemsMessage="U hebt op dit moment geen lopende aanvragen."
        className={styles.SectionCollapsibleFirst}
      >
        <Table
          items={itemsRequested}
          displayProps={requestsDisplayProps}
          className={styles.Table}
        />
      </SectionCollapsible>
      <SectionCollapsible
        id="SectionCollapsible-income-request-process-decisions"
        startCollapsed={hasActiveRequests}
        isLoading={isLoadingFocus}
        hasItems={hasActiveDescisions}
        title="Afgehandelde aanvragen"
        track={{
          category: 'Inkomen en Stadspas overzicht / Afgehandelde aanvragen',
          name: 'Datatabel',
        }}
        noItemsMessage="U hebt op dit moment geen afgehandelde aanvragen."
      >
        <Table
          items={itemsDecided}
          displayProps={decisionsDisplayProps}
          className={styles.Table}
        />
      </SectionCollapsible>
      {FeatureToggle.focusCombinedActive && (
        <SectionCollapsible
          id="SectionCollapsible-income-specifications-monthly"
          startCollapsed={hasActiveRequests || hasActiveDescisions}
          isLoading={isLoadingFocusSpecificaties}
          title="Uitkeringsspecificaties"
          hasItems={!!uitkeringsspecificaties.length}
          track={{
            category: 'Inkomen en Stadspas overzicht / Uitkeringsspecificaties',
            name: 'Datatabel',
          }}
          noItemsMessage="Er zijn op dit moment geen uitkeringgspecificaties."
        >
          <Table
            className={specicationsStyles.SpecificationsTable}
            items={itemsSpecificationsMonthly}
            displayProps={specificationsTableDisplayProps}
          />
          {uitkeringsspecificaties.length > 3 && (
            <p className={styles.ShowAllButtonContainer}>
              <Linkd href={incomSpecificationsRouteMonthly}>Toon alles</Linkd>
            </p>
          )}
        </SectionCollapsible>
      )}
      {FeatureToggle.focusCombinedActive && (
        <SectionCollapsible
          id="SectionCollapsible-income-specifications-yearly"
          startCollapsed={hasActiveRequests || hasActiveDescisions}
          isLoading={isLoadingFocus}
          title="Jaaropgaven"
          hasItems={!!jaaropgaven.length}
          track={{
            category: 'Inkomen en Stadspas overzicht / Jaaropgaven',
            name: 'Datatabel',
          }}
          noItemsMessage="Er zijn op dit moment geen Jaaropgaven."
        >
          <Table
            className={classnames(
              specicationsStyles.SpecificationsTable,
              specicationsStyles['SpecificationsTable--annualStatements']
            )}
            items={itemsSpecificationsYearly}
            displayProps={annualStatementsTableDisplayProps}
          />
          {jaaropgaven.length > 3 && (
            <p className={styles.ShowAllButtonContainer}>
              <Linkd href={incomSpecificationsRouteYearly}>Toon alles</Linkd>
            </p>
          )}
        </SectionCollapsible>
      )}
    </OverviewPage>
  );
};
