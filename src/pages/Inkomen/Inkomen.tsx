import React, { useContext, useMemo } from 'react';
import { OverviewPage, PageContent } from 'components/Page/Page';
import PageHeading from 'components/PageHeading/PageHeading';
import { AppContext } from 'AppState';
import { ChapterTitles } from 'config/Chapter.constants';
import styles from './Inkomen.module.scss';
import { ExternalUrls } from 'config/App.constants';
import Alert from 'components/Alert/Alert';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import Linkd from 'components/Button/Button';
import { AppRoutes } from 'config/Routing.constants';
import { generatePath } from 'react-router-dom';
import SectionCollapsible from 'components/SectionCollapsible/SectionCollapsible';
import Table, { addTitleLinkComponent } from 'components/Table/Table';

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
      data: { products },
      isError,
      isLoading,
    },
    FOCUS_INKOMEN_SPECIFICATIES: {
      data: incomeSpecificationItems,
      isError: isError2,
      isLoading: isLoading2,
    },
  } = useContext(AppContext);

  const items = useMemo(
    () => Object.values(products).flatMap(product => product.items),
    [products]
  );
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
            Naar alle regelingen voor Werk en inkomen
          </Linkd>
          <br />
          <Linkd external={true} href={ExternalUrls.WPI_CONTACT}>
            Contact Werk en inkomen
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
        track={{
          category: 'Werk en inkomen overzicht / Lopende aanvragen',
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
        title="Besluiten"
        track={{
          category: 'Werk en inkomen overzicht / Besluiten',
          name: 'Datatabel',
        }}
        noItemsMessage="U hebt op dit moment geen besluiten."
      >
        <Table items={itemsDecided} />
      </SectionCollapsible>
      <SectionCollapsible
        id="SectionCollapsible-income-specifications-monthly"
        startCollapsed={hasActiveRequests || hasActiveDescisions}
        isLoading={isLoading2}
        title="Uitkeringsspecificaties"
        track={{
          category: 'Werk en inkomen overzicht / Uitkeringsspecificaties',
          name: 'Datatabel',
        }}
        noItemsMessage="Er zijn op dit moment geen uitkeringgspecificaties."
      >
        <Table
          items={itemsSpecificationsMonthly}
          displayProps={{
            title: 'Omschrijving',
            type: 'Type',
            displayDate: 'Datum',
            documentUrl: 'Document',
          }}
        />
        <p className={styles.ShowAllButtonContainer}>
          <Linkd href={incomSpecificationsRouteMonthly}>Toon alles</Linkd>
        </p>
      </SectionCollapsible>
      <SectionCollapsible
        id="SectionCollapsible-income-specifications-yearly"
        startCollapsed={hasActiveRequests || hasActiveDescisions}
        isLoading={isLoading2}
        title="Jaaropgaven"
        track={{
          category: 'Werk en inkomen overzicht / Jaaropgaven',
          name: 'Datatabel',
        }}
        noItemsMessage="Er zijn op dit moment geen Jaaropgaven."
      >
        <Table
          items={itemsSpecificationsYearly}
          displayProps={{
            title: 'Omschrijving',
            type: 'Type',
            displayDate: 'Datum',
            documentUrl: 'Document',
          }}
        />
        <p className={styles.ShowAllButtonContainer}>
          <Linkd href={incomSpecificationsRouteYearly}>Toon alles</Linkd>
        </p>
      </SectionCollapsible>
    </OverviewPage>
  );
};
