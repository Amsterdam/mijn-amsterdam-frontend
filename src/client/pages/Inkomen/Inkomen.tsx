import {
  Alert,
  ChapterIcon,
  Linkd,
  OverviewPage,
  PageContent,
  PageHeading,
  SectionCollapsible,
  Table,
} from '../../components';
import {
  AppRoutes,
  ChapterTitles,
  ExternalUrls,
  FeatureToggle,
} from '../../../universal/config';
import React, { useContext, useMemo } from 'react';
import { isError, isLoading } from '../../../universal/helpers';

import { AppContext } from '../../AppState';
import { addTitleLinkComponent } from '../../components/Button/Button';
import { generatePath } from 'react-router-dom';
import specicationsStyles from '../InkomenSpecificaties/InkomenSpecificaties.module.scss';
import {
  annualStatementsTableDisplayProps,
  specificationsTableDisplayProps,
} from '../../pages/InkomenSpecificaties/InkomenSpecificaties';
import styles from './Inkomen.module.scss';

import {
  incomSpecificationsRouteMonthly,
  incomSpecificationsRouteYearly,
} from '../../../server/services/focus';
import classnames from 'classnames';

const requestsDisplayProps = {
  dateStart: 'Datum aanvraag',
  status: 'Status',
};
const decisionsDisplayProps = {
  dateStart: 'Datum aanvraag',
  datePublished: 'Datum besluit',
};

export default () => {
  const { FOCUS } = useContext(AppContext);

  const itemsRequested = useMemo(() => {
    if (!FOCUS?.aanvragen) {
      return [];
    }
    return addTitleLinkComponent(
      FOCUS?.aanvragen.filter(item => !item.hasDecision)
    );
  }, [FOCUS]);

  const itemsDecided = useMemo(() => {
    if (!FOCUS?.aanvragen) {
      return [];
    }
    return addTitleLinkComponent(
      FOCUS?.aanvragen.filter(item => item.hasDecision)
    );
  }, [FOCUS]);

  const hasActiveRequests = !!itemsRequested.length;
  const hasActiveDescisions = !!itemsDecided.length;

  const itemsSpecificationsMonthly =
    FOCUS?.uitkeringsspecificaties.slice(0, 3) || [];
  const itemsSpecificationsYearly = FOCUS?.jaaropgaven.slice(0, 3) || [];

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
        {isError(FOCUS) && (
          <Alert type="warning">
            <p>We kunnen op dit moment niet alle gegevens tonen.</p>
          </Alert>
        )}
      </PageContent>
      <SectionCollapsible
        id="SectionCollapsible-income-request-process"
        title="Lopende aanvragen"
        startCollapsed={false}
        isLoading={isLoading(FOCUS)}
        hasItems={hasActiveRequests}
        track={{
          category: 'Inkomen en Stadspas overzicht / Lopende aanvragen',
          name: 'Datatabel',
        }}
        noItemsMessage="U hebt op dit moment geen lopende aanvragen."
        className={styles.SectionCollapsibleRequests}
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
        isLoading={isLoading(FOCUS)}
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
      {FeatureToggle.focusUitkeringsspecificatiesActive && (
        <SectionCollapsible
          id="SectionCollapsible-income-specifications-monthly"
          startCollapsed={hasActiveRequests || hasActiveDescisions}
          isLoading={isLoading(FOCUS)}
          title="Uitkeringsspecificaties"
          hasItems={!!FOCUS?.uitkeringsspecificaties.length}
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
          {FOCUS && FOCUS.uitkeringsspecificaties.length > 3 && (
            <p className={styles.ShowAllButtonContainer}>
              <Linkd href={incomSpecificationsRouteMonthly}>Toon alles</Linkd>
            </p>
          )}
        </SectionCollapsible>
      )}
      {FeatureToggle.focusUitkeringsspecificatiesActive && (
        <SectionCollapsible
          id="SectionCollapsible-income-specifications-yearly"
          startCollapsed={hasActiveRequests || hasActiveDescisions}
          isLoading={isLoading(FOCUS)}
          title="Jaaropgaven"
          hasItems={!!FOCUS?.jaaropgaven.length}
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
          {FOCUS && FOCUS.jaaropgaven.length > 3 && (
            <p className={styles.ShowAllButtonContainer}>
              <Linkd href={incomSpecificationsRouteYearly}>Toon alles</Linkd>
            </p>
          )}
        </SectionCollapsible>
      )}
    </OverviewPage>
  );
};
