import { Alert, Paragraph } from '@amsterdam/design-system-react';
import { useParams } from 'react-router';

import type {
  AfisFactuurFrontend} from './Afis-thema-config.ts';
import {
  displayPropsTermijnenTable,
  routeConfig,
} from './Afis-thema-config.ts';
import styles from './AfisFactuur.module.scss';
import { getDocumentLink } from './useAfisFacturenApi.tsx';
import { useAfisListPageData } from './useAfisListPageData.tsx';
import {
  useAfisFacturenData,
  type AfisFacturenThemaContextParams,
} from './useAfisThemaData.hook.tsx';
import type { AfisFactuurStateFrontend } from '../../../../server/services/afis/afis-types.ts';
import { Datalist } from '../../../components/Datalist/Datalist.tsx';
import LoadingContent from '../../../components/LoadingContent/LoadingContent.tsx';
import { MaRouterLink } from '../../../components/MaLink/MaLink.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import { TableV2 } from '../../../components/Table/TableV2.tsx';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems.ts';

function getTermijnenTable(factuur: AfisFactuurFrontend) {
  if (!factuur.termijnen || factuur.termijnen.length === 0) {
    return 'Geen termijnen beschikbaar';
  }

  return (
    <TableV2
      className={styles.termijnenTable}
      showTHead
      contentAfterTheCaption={
        <Paragraph className="ams-mb-m">
          De factuur wordt in termijnen per automatische incasso voldaan.
        </Paragraph>
      }
      items={factuur.termijnen}
      displayProps={displayPropsTermijnenTable}
    />
  );
}

type FactuurDetailContentProps = {
  factuurNummer: AfisFactuurFrontend['factuurNummer'];
  state: AfisFactuurStateFrontend;
  themaContextParams?: AfisFacturenThemaContextParams;
};

function FactuurDetailContent({
  factuurNummer,
  state,
  themaContextParams,
}: FactuurDetailContentProps) {
  const { facturen, isListPageLoading } = useAfisListPageData(
    state,
    themaContextParams
  );

  const factuur =
    facturen.find((f) => f.factuurNummer === factuurNummer) ?? null;

  if (isListPageLoading) {
    return <LoadingContent />;
  }

  if (!factuur) {
    return (
      <Alert
        severity="warning"
        heading="Factuur niet gevonden"
        headingLevel={3}
      >
        We kunnen de gevraagde factuur niet vinden.{' '}
        <MaRouterLink href={routeConfig.themaPage.path}>
          Ga terug naar het overzicht
        </MaRouterLink>
      </Alert>
    );
  }

  const rows = [
    {
      label: 'Factuurnummer',
      content: factuur.factuurNummer ?? '-',
    },
    {
      label: 'Vervaldatum',
      content: factuur.paymentDueDateFormatted ?? '-',
      isVisible:
        !!factuur.paymentDueDateFormatted &&
        factuur.status !== 'automatische-incasso-termijnen',
    },
    {
      label: 'Afzender',
      content: factuur.afzender ?? '-',
    },
    {
      label: 'Status',
      content: factuur.statusDescription ?? '-',
      isVisible: factuur.status !== 'automatische-incasso-termijnen',
    },
    {
      label: 'Termijnen',
      content: getTermijnenTable(factuur),
      isVisible: factuur.status === 'automatische-incasso-termijnen',
    },
    {
      label: 'Download',
      content: getDocumentLink(factuur) ?? 'niet beschikbaar',
    },
  ];

  return <Datalist rows={rows} />;
}

type AfisListProps = {
  themaContextParams?: Omit<AfisFacturenThemaContextParams, 'factuurFilterFn'>;
};

export function AfisFactuur({ themaContextParams }: AfisListProps) {
  const {
    routeConfigDetailPage,
    themaId,
    isThemaPaginaError,
    isThemaPaginaLoading,
  } = useAfisFacturenData(themaContextParams);
  const breadcrumbs = useThemaBreadcrumbs(themaId);

  const { factuurNummer, state } = useParams<{
    factuurNummer: AfisFactuurFrontend['factuurNummer'];
    state: AfisFactuurStateFrontend;
  }>();

  useHTMLDocumentTitle(routeConfigDetailPage);

  const title = `Factuurgegevens ${factuurNummer ?? ''}`;

  return (
    <ThemaDetailPagina
      themaId={themaId}
      title={title}
      zaak={{}}
      isError={isThemaPaginaError}
      isLoading={isThemaPaginaLoading}
      pageContentMain={
        state &&
        factuurNummer && (
          <PageContentCell>
            <FactuurDetailContent
              factuurNummer={factuurNummer}
              state={state}
              themaContextParams={themaContextParams}
            />
          </PageContentCell>
        )
      }
      breadcrumbs={breadcrumbs}
    />
  );
}
