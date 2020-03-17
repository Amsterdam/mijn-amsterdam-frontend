import React, { useContext, useMemo } from 'react';
import { OverviewPage, PageContent } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import { AppContext } from 'AppState';
import { ChapterTitles } from 'config/Chapter.constants';
import styles from './Inkomen.module.scss';
import specicationsStyles from '../InkomenSpecificaties/InkomenSpecificaties.module.scss';
import { ExternalUrls } from 'config/App.constants';
import Alert from 'components/Alert/Alert';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import Linkd from 'components/Button/Button';
import { AppRoutes } from 'config/Routing.constants';
import { generatePath } from 'react-router-dom';
import SectionCollapsible from 'components/SectionCollapsible/SectionCollapsible';
import Table, { addTitleLinkComponent } from 'components/Table/Table';
import { specificationsTableDisplayProps } from 'pages/InkomenSpecificaties/InkomenSpecificaties';
import { FeatureToggle } from '../../config/App.constants';

const incomSpecificationsRouteMonthly = generatePath(
  AppRoutes['INKOMEN/SPECIFICATIES']
);
const incomSpecificationsRouteYearly = generatePath(
  AppRoutes['INKOMEN/SPECIFICATIES'],
  {
    type: 'jaaropgaven',
  }
);

export default () => {
  const {
    FOCUS: {
      data: { items },
      isError,
      isLoading,
    },
    FOCUS_INKOMEN_SPECIFICATIES: {
      data: incomeSpecificationItems,
      isError: isError2,
      isLoading: isLoading2,
    },
  } = useContext(AppContext);

  const itemsRequested = useMemo(() => {
    return addTitleLinkComponent(items.filter(item => !item.hasDecision));
  }, [items]);

  const itemsDecided = useMemo(() => {
    return addTitleLinkComponent(items.filter(item => item.hasDecision));
  }, [items]);

  const hasActiveRequests = !!itemsRequested.length;
  const hasActiveDescisions = !!itemsDecided.length;
  const itemsSpecificationsMonthly = incomeSpecificationItems
    .filter(item => !item.isAnnualStatement)
    .slice(0, 3);

  const itemsSpecificationsYearly = incomeSpecificationItems
    .filter(item => item.isAnnualStatement)
    .slice(0, 3);

  return (
    <OverviewPage className={styles.Inkomen}>
      <PageHeading icon={<ChapterIcon />}>{ChapterTitles.INKOMEN}</PageHeading>
      <PageContent>
        <p>
          Hieronder vindt u een overzicht van alle voorzieningen die u hebt ter
          aanvulling of ondersteuning bij een laag inkomen.
        </p>
        <p>
          <Linkd external={true} href={ExternalUrls.WPI_REGELINGEN}>
            Naar alle regelingen voor Inkomen en Stadspas
          </Linkd>
          <br />
          <Linkd external={true} href={ExternalUrls.WPI_CONTACT}>
            Contact Inkomen en Stadspas
          </Linkd>
        </p>
        {(isError || isError2) && (
          <Alert type="warning">
            We kunnen op dit moment niet alle gegevens tonen.
          </Alert>
        )}
      </PageContent>
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
        className={styles.SectionCollapsibleRequests}
      >
        <Table items={itemsRequested} />
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
        <Table items={itemsDecided} />
      </SectionCollapsible>
      {FeatureToggle.focusUitkeringsspecificatiesActive && (
        <SectionCollapsible
          id="SectionCollapsible-income-specifications-monthly"
          startCollapsed={hasActiveRequests || hasActiveDescisions}
          isLoading={isLoading2}
          title="Uitkeringsspecificaties"
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
          <p className={styles.ShowAllButtonContainer}>
            <Linkd href={incomSpecificationsRouteMonthly}>Toon alles</Linkd>
          </p>
        </SectionCollapsible>
      )}
      {FeatureToggle.focusUitkeringsspecificatiesActive && (
        <SectionCollapsible
          id="SectionCollapsible-income-specifications-yearly"
          startCollapsed={hasActiveRequests || hasActiveDescisions}
          isLoading={isLoading2}
          title="Jaaropgaven"
          track={{
            category: 'Inkomen en Stadspas overzicht / Jaaropgaven',
            name: 'Datatabel',
          }}
          noItemsMessage="Er zijn op dit moment geen Jaaropgaven."
        >
          <Table
            className={specicationsStyles.SpecificationsTable}
            items={itemsSpecificationsYearly}
            displayProps={specificationsTableDisplayProps}
          />
          <p className={styles.ShowAllButtonContainer}>
            <Linkd href={incomSpecificationsRouteYearly}>Toon alles</Linkd>
          </p>
        </SectionCollapsible>
      )}
    </OverviewPage>
  );
};
