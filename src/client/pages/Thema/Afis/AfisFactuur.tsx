import { Alert } from '@amsterdam/design-system-react';
import { useParams } from 'react-router';

import type { AfisFactuurFrontend } from './Afis-thema-config';
import { getDocumentLink } from './useAfisFacturenApi';
import { useAfisListPageData } from './useAfisListPageData';
import { useAfisThemaData } from './useAfisThemaData.hook';
import type { AfisFactuurState } from '../../../../server/services/afis/afis-types';
import { Datalist } from '../../../components/Datalist/Datalist';
import LoadingContent from '../../../components/LoadingContent/LoadingContent';
import { MaRouterLink } from '../../../components/MaLink/MaLink';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

type FactuurDetailContentProps = {
  factuurNummer: AfisFactuurFrontend['factuurNummer'];
  state: AfisFactuurState;
};

function FactuurDetailContent({
  factuurNummer,
  state,
}: FactuurDetailContentProps) {
  const { facturenListResponse, routeConfig, isListPageLoading } =
    useAfisListPageData(state);

  const factuur =
    facturenListResponse?.facturen.find(
      (f) => f.factuurNummer === factuurNummer
    ) ?? null;

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
      isVisible: !!factuur.paymentDueDateFormatted,
    },
    {
      label: 'Afzender',
      content: factuur.afzender ?? '-',
    },

    {
      label: 'Status',
      content: factuur.statusDescription ?? '-',
    },
    {
      label: 'Download',
      content: getDocumentLink(factuur) ?? 'niet beschikbaar',
    },
  ];

  return <Datalist rows={rows} />;
}

export function AfisFactuur() {
  const {
    breadcrumbs,
    routeConfig,
    themaId,
    isThemaPaginaError,
    isThemaPaginaLoading,
  } = useAfisThemaData();

  const { factuurNummer, state } = useParams<{
    factuurNummer: AfisFactuurFrontend['factuurNummer'];
    state: AfisFactuurState;
  }>();

  useHTMLDocumentTitle(routeConfig.detailPage);

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
            <FactuurDetailContent factuurNummer={factuurNummer} state={state} />
          </PageContentCell>
        )
      }
      breadcrumbs={breadcrumbs}
    />
  );
}
