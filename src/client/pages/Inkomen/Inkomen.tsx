import classnames from 'classnames';
import React, { useMemo } from 'react';
import { generatePath } from 'react-router-dom';
import {
  AppRoutes,
  ChapterTitles,
  FeatureToggle,
} from '../../../universal/config';
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
} from '../../components';
import { ExternalUrls } from '../../config/app';
import { useAppStateGetter } from '../../hooks/useAppState';
import {
  annualStatementsTableDisplayProps,
  specificationsTableDisplayProps,
} from '../../pages/InkomenSpecificaties/InkomenSpecificaties';
import specicationsStyles from '../InkomenSpecificaties/InkomenSpecificaties.module.scss';
import { useAddDocumentLinkComponents } from '../InkomenSpecificaties/useAddDocumentLinks';
import AlertDocumentDownloadsDisabled from './AlertDocumentDownloadsDisabled';
import styles from './Inkomen.module.scss';
import { LinkdInline } from '../../components/Button/Button';

export const incomSpecificationsRouteMonthly = generatePath(
  AppRoutes['INKOMEN/SPECIFICATIES']
);

export const incomSpecificationsRouteYearly = generatePath(
  AppRoutes['INKOMEN/SPECIFICATIES'],
  {
    type: 'jaaropgaven',
  }
);

const stadspasDisplayProps = {
  naam: '',
  pasnummer: 'Stadspasnummer',
  displayDatumAfloop: 'Einddatum',
  detailPageUrl: '',
};

const requestsDisplayProps = {
  displayDateStart: 'Datum aanvraag',
  status: 'Status',
};

const decisionsDisplayProps = {
  displayDateStart: 'Datum aanvraag',
  displayDatePublished: 'Datum besluit',
};

export default () => {
  const {
    FOCUS_AANVRAGEN,
    FOCUS_SPECIFICATIES,
    FOCUS_TOZO,
    FOCUS_STADSPAS,
  } = useAppStateGetter();
  const focusSpecificatiesWithDocumentLinks = useAddDocumentLinkComponents(
    FOCUS_SPECIFICATIES
  );
  const aanvragen = FOCUS_AANVRAGEN.content;
  const tozoItems = FOCUS_TOZO.content;
  const uitkeringsspecificaties =
    focusSpecificatiesWithDocumentLinks.content?.uitkeringsspecificaties;
  const jaaropgaven = focusSpecificatiesWithDocumentLinks.content?.jaaropgaven;

  const itemsRequested = useMemo(() => {
    const itemsRequested =
      aanvragen?.filter(item =>
        item.steps.every(step => step.title !== 'beslissing')
      ) || [];

    if (tozoItems?.length && FeatureToggle.tozoActive) {
      itemsRequested.push(
        ...tozoItems.filter(tozoItem => tozoItem.status !== 'Besluit')
      );
    }

    return addTitleLinkComponent(
      itemsRequested
        .map(item => {
          return Object.assign({}, item, {
            displayDatePublished: defaultDateFormat(item.datePublished),
            displayDateStart: defaultDateFormat(item.dateStart),
          });
        })
        .sort(dateSort('datePublished', 'desc'))
    );
  }, [aanvragen, tozoItems]);

  const itemsDecided = useMemo(() => {
    const itemsDecided =
      aanvragen?.filter(item =>
        item.steps.some(step => step.title === 'beslissing')
      ) || [];

    if (tozoItems?.length && FeatureToggle.tozoActive) {
      itemsDecided.push(
        ...tozoItems.filter(tozoItem => tozoItem.status === 'Besluit')
      );
    }

    return addTitleLinkComponent(
      itemsDecided
        .map(item => {
          return Object.assign({}, item, {
            displayDatePublished: defaultDateFormat(item.datePublished),
            displayDateStart: defaultDateFormat(item.dateStart),
          });
        })
        .sort(dateSort('datePublished', 'desc'))
    );
  }, [aanvragen, tozoItems]);

  const hasActiveRequests = !!itemsRequested.length;
  const hasActiveDescisions = !!itemsDecided.length;
  const hasStadspas = !!FOCUS_STADSPAS?.content?.length;

  const itemsSpecificationsMonthly = useMemo(
    () => uitkeringsspecificaties?.slice(0, 3) || [],
    [uitkeringsspecificaties]
  );
  const itemsSpecificationsYearly = useMemo(
    () => jaaropgaven?.slice(0, 3) || [],
    [jaaropgaven]
  );

  const stadspasItems = useMemo(() => {
    if (!FOCUS_STADSPAS.content?.length) {
      return [];
    }
    return FOCUS_STADSPAS.content.map(pass => {
      return {
        ...pass,
        displayDatumAfloop: defaultDateFormat(pass.datumAfloop),
        detailPageUrl: (
          <LinkdInline
            href={generatePath(AppRoutes['INKOMEN/STADSPAS/SALDO'], {
              id: pass.id,
            })}
          >
            Bekijk saldo
          </LinkdInline>
        ),
      };
    });
  }, [FOCUS_STADSPAS.content]);

  const isLoadingFocus = isLoading(FOCUS_AANVRAGEN) || isLoading(FOCUS_TOZO);
  const isLoadingFocusSpecificaties = isLoading(FOCUS_SPECIFICATIES);
  const isLoadingStadspas = isLoading(FOCUS_STADSPAS);

  return (
    <OverviewPage className={styles.Inkomen}>
      <PageHeading isLoading={false} icon={<ChapterIcon />}>
        {ChapterTitles.INKOMEN}
      </PageHeading>
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
          isError(FOCUS_STADSPAS) ||
          isError(FOCUS_TOZO)) && (
          <Alert type="warning">
            <p>We kunnen op dit moment niet alle gegevens tonen.</p>
          </Alert>
        )}
        <AlertDocumentDownloadsDisabled />
        {!FeatureToggle.tozo3active &&
          tozoItems?.some(item => item.productTitle === 'Tozo 2') && (
            <Alert type="warning">
              <p>
                Hebt u Tozo 3 aangevraagd (vanaf 1 oktober 2020)? Wij werken er
                hard aan om ook die aanvraag in Mijn Amsterdam te tonen. Als het
                zover is, ziet u uw aanvraag vanzelf hier verschijnen.
              </p>
            </Alert>
          )}
      </PageContent>

      <SectionCollapsible
        id="SectionCollapsible-stadpas"
        title="Stadspas"
        startCollapsed={false}
        isLoading={isLoadingStadspas}
        hasItems={hasStadspas}
        track={{
          category: 'Inkomen en Stadspas overzicht / Stadpas',
          name: 'Datatabel',
        }}
        noItemsMessage="U hebt op dit moment geen lopende aanvragen."
        className={styles.SectionCollapsibleFirst}
      >
        <Table
          titleKey="moreDetail"
          items={stadspasItems}
          displayProps={stadspasDisplayProps}
          className={styles.Table}
        />
      </SectionCollapsible>

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
        className={
          hasStadspas
            ? styles.SectionCollapsible
            : styles.SectionCollapsibleFirst
        }
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
        title="Eerdere aanvragen"
        track={{
          category: 'Inkomen en Stadspas overzicht / Eerdere aanvragen',
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

      {FeatureToggle.focusCombinedActive && (
        <SectionCollapsible
          id="SectionCollapsible-income-specifications-monthly"
          startCollapsed={hasActiveRequests || hasActiveDescisions}
          isLoading={isLoadingFocusSpecificaties}
          title="Uitkeringsspecificaties"
          hasItems={!!uitkeringsspecificaties?.length}
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
          {uitkeringsspecificaties?.length &&
            uitkeringsspecificaties.length > 3 && (
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
          hasItems={!!jaaropgaven?.length}
          track={{
            category: 'Inkomen en Stadspas overzicht / Jaaropgaven',
            name: 'Datatabel',
          }}
          noItemsMessage="Er zijn op dit moment geen jaaropgaven."
        >
          <Table
            className={classnames(
              specicationsStyles.SpecificationsTable,
              specicationsStyles['SpecificationsTable--annualStatements']
            )}
            items={itemsSpecificationsYearly}
            displayProps={annualStatementsTableDisplayProps}
          />
          {jaaropgaven?.length && jaaropgaven.length > 3 && (
            <p className={styles.ShowAllButtonContainer}>
              <Linkd href={incomSpecificationsRouteYearly}>Toon alles</Linkd>
            </p>
          )}
        </SectionCollapsible>
      )}
    </OverviewPage>
  );
};
