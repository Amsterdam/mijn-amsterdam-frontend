import { Alert, Paragraph } from '@amsterdam/design-system-react';
import { useParams } from 'react-router';

import {
  AfisFactuurFrontend,
  displayPropsTermijnenTable,
  routeConfig,
} from './Afis-thema-config';
import styles from './AfisFactuur.module.scss';
import { getDocumentLink } from './useAfisFacturenApi';
import { useAfisListPageData } from './useAfisListPageData';
import {
  useAfisFacturenData,
  type AfisFacturenThemaContextParams,
} from './useAfisThemaData.hook';
import type { AfisFactuurStateFrontend } from '../../../../server/services/afis/afis-types';
import { Datalist } from '../../../components/Datalist/Datalist';
import LoadingContent from '../../../components/LoadingContent/LoadingContent';
import { MaRouterLink } from '../../../components/MaLink/MaLink';
import { PageContentCell } from '../../../components/Page/Page';
import { TableV2 } from '../../../components/Table/TableV2';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

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
  themaContextParams?: AfisFacturenThemaContextParams;
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
