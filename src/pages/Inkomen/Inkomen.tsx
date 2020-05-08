import { ExternalUrls, FeatureToggle } from 'config/App.constants';
import { OverviewPage, PageContent } from 'components/Page/Page';
import React, { useContext, useMemo } from 'react';
import Table, { addTitleLinkComponent } from 'components/Table/Table';
import {
  annualStatementsTableDisplayProps,
  specificationsTableDisplayProps,
} from 'pages/InkomenSpecificaties/InkomenSpecificaties';

import Alert from 'components/Alert/Alert';
import { AppContext } from 'AppState';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import { ChapterTitles } from 'config/Chapter.constants';
import Linkd from 'components/Button/Button';
import PageHeading from 'components/PageHeading/PageHeading';
import SectionCollapsible, {
  SectionCollapsibleHeading,
} from 'components/SectionCollapsible/SectionCollapsible';
import classnames from 'classnames';
import specicationsStyles from '../InkomenSpecificaties/InkomenSpecificaties.module.scss';
import styles from './Inkomen.module.scss';
import useRouter from 'use-react-router';
import { AppRoutes } from '../../config/Routing.constants';
import {
  incomSpecificationsRouteMonthly,
  incomSpecificationsRouteYearly,
} from '../../data-formatting/focus';

const requestsDisplayProps = {
  dateStart: 'Datum aanvraag',
  status: 'Status',
};

const decisionsDisplayProps = {
  dateStart: 'Datum aanvraag',
  datePublished: 'Datum besluit',
};

export default () => {
  const {
    FOCUS: {
      data: { items },
      isError,
      isLoading,
    },
    FOCUS_SPECIFICATIONS: {
      data: { jaaropgaven, uitkeringsspecificaties },
      isError: isError2,
      isLoading: isLoading2,
    },
  } = useContext(AppContext);

  const { history } = useRouter();

  const noTozo = true;

  const itemsRequested = useMemo(() => {
    return addTitleLinkComponent(items.filter(item => !item.hasDecision));
  }, [items]);

  const itemsDecided = useMemo(() => {
    return addTitleLinkComponent(items.filter(item => item.hasDecision));
  }, [items]);

  const hasActiveRequests = !!itemsRequested.length;
  const hasActiveDescisions = !!itemsDecided.length;
  const itemsSpecificationsMonthly = uitkeringsspecificaties.slice(0, 3);
  const itemsSpecificationsYearly = jaaropgaven.slice(0, 3);

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
        {(isError || isError2) && (
          <Alert type="warning">
            <p>We kunnen op dit moment niet alle gegevens tonen.</p>
          </Alert>
        )}
      </PageContent>
      {FeatureToggle.tozoActive && (
        <section>
          <SectionCollapsibleHeading
            isAriaExpanded={false}
            toggleCollapsed={() => history.push(AppRoutes['INKOMEN/TOZO'])}
            hasItems={true}
          >
            Tozo
          </SectionCollapsibleHeading>
        </section>
      )}
      <SectionCollapsible
        id="SectionCollapsible-income-request-process"
        title="Lopende aanvragen"
        startCollapsed={false}
        isLoading={isLoading}
        hasItems={hasActiveRequests}
        track={{
          category: 'Inkomen en Stadspas overzicht / Lopende aanvragen',
          name: 'Datatabel',
        }}
        noItemsMessage="U hebt op dit moment geen lopende aanvragen."
        className={noTozo ? styles.SectionCollapsibleFirst : ''}
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
        isLoading={isLoading}
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
          isLoading={isLoading2}
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
          isLoading={isLoading2}
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
