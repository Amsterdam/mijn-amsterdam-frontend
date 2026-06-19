import { Alert, Paragraph } from '@amsterdam/design-system-react';

import { tableConfigSpecificaties } from './Inkomen-thema-config.ts';
import { useInkomenThemaData } from './useInkomenThemaData.hook.ts';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import { ThemaPagina } from '../../../components/Thema/ThemaPagina.tsx';
import { ThemaPaginaTable } from '../../../components/Thema/ThemaPaginaTable.tsx';
import { getFeedbackDetailsByTableConfig } from '../../../components/UserFeedback/UserFeedback.helpers.ts';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

const pageContentTop = (
  <PageContentCell spanWide={8}>
    <Alert
      severity="warning"
      heading="Technische storing / onderhoud"
      headingLevel={3}
      className="ams-mb-m"
    >
      <Paragraph className="ams-mb-s">
        Momenteel is er sprake van een storing met het downloaden van
        documenten. We werken hard aan een oplossing. Op dit moment is nog niet
        bekend wanneer de storing verholpen zal zijn. Zodra er meer informatie
        beschikbaar is, informeren wij u hierover.
      </Paragraph>

      <strong>Betaling van uw uitkering</strong>
      <Paragraph>
        De betaling van uw uitkering verloopt gewoon volgens planning en wordt
        op 23 juni uitbetaald. Op 25 juni ontvangt u ook de papieren
        uitkeringsspecificatie per post.
      </Paragraph>
    </Alert>
    <Paragraph>
      Op deze pagina vindt u informatie over uw uitkering en de ondersteuning
      die u krijgt omdat u weinig geld hebt.
    </Paragraph>
  </PageContentCell>
);

export function InkomenThema() {
  const {
    themaId,
    title,
    tableConfig,
    zaken,
    isLoadingWpi,
    isErrorWpi,
    isErrorWpiSpecificaties,
    isLoadingWpiSpecificaties,
    pageLinks,
    specificaties,
    jaaropgaven,
    themaConfig,
  } = useInkomenThemaData();
  useHTMLDocumentTitle(themaConfig.route);

  const tables = Object.entries(tableConfig).map(
    ([kind, { title, displayProps, filter, listPageRoute, maxItems }]) => {
      return (
        <ThemaPaginaTable
          key={kind}
          title={title}
          listPageRoute={listPageRoute}
          zaken={zaken.filter(filter)}
          displayProps={displayProps}
          maxItems={maxItems}
        />
      );
    }
  );

  const tablesSpecificaties = Object.entries(tableConfigSpecificaties).map(
    ([kind, { title, displayProps, listPageRoute, maxItems }]) => {
      return (
        <ThemaPaginaTable
          key={kind}
          title={title}
          listPageRoute={listPageRoute}
          zaken={kind === 'jaaropgaven' ? jaaropgaven : specificaties}
          displayProps={displayProps}
          maxItems={maxItems}
        />
      );
    }
  );

  const themaPaginaDetails = {
    ...getFeedbackDetailsByTableConfig(zaken, tableConfig),
    ...getFeedbackDetailsByTableConfig(specificaties, {
      specificaties: tableConfigSpecificaties.uitkering,
    }),
    ...getFeedbackDetailsByTableConfig(jaaropgaven, {
      jaaropgaven: tableConfigSpecificaties.uitkering,
    }),
  };

  return (
    <ThemaPagina
      id={themaId}
      title={title}
      isError={isErrorWpi || isErrorWpiSpecificaties}
      isLoading={isLoadingWpi || isLoadingWpiSpecificaties}
      pageContentTop={pageContentTop}
      pageContentMain={
        <>
          {tables}
          {tablesSpecificaties}
        </>
      }
      pageLinks={pageLinks}
      maintenanceNotificationsPageSlug="inkomen"
      themaFeedbackDetails={themaPaginaDetails}
    />
  );
}
