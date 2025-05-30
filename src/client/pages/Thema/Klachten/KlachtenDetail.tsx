import { useParams } from 'react-router';

import { useKlachtenThemaData } from './useKlachtenThemaData.hook';
import type { KlachtFrontend } from '../../../../server/services/klachten/types';
import { Datalist, Row, RowSet } from '../../../components/Datalist/Datalist';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

type KlachtenDetailContentProps = {
  klacht: KlachtFrontend;
};

function KlachtenDetailContent({ klacht }: KlachtenDetailContentProps) {
  const rows: Array<Row | RowSet> = [
    {
      label: 'Nummer van uw klacht',
      content: klacht?.id || '-',
    },
    {
      label: 'Ontvangen op',
      content: klacht?.ontvangstDatumFormatted,
    },
    {
      label: 'Wat is de klacht?',
      content: klacht?.omschrijving,
    },
    {
      label: 'Wat is de locatie waar de klacht is ontstaan?',
      content: klacht?.locatie,
    },
    {
      label:
        'Wat wilt u dat de gemeente gaat doen naar aanleiding van uw klacht?',
      content: klacht?.gewensteOplossing,
    },
  ].filter((row) => !!row.content);

  return (
    <PageContentCell>
      <Datalist rows={rows} />
    </PageContentCell>
  );
}

export function KlachtenDetail() {
  const { klachten, isLoading, isError, breadcrumbs, routeConfig } =
    useKlachtenThemaData();
  useHTMLDocumentTitle(routeConfig.detailPage);
  const { id } = useParams<{ id: string }>();
  const klacht = klachten.find((klacht) => klacht.id === id);

  return (
    <ThemaDetailPagina
      title={klacht?.onderwerp || 'Klacht'}
      zaak={klacht}
      isError={isError}
      isLoading={isLoading}
      pageContentMain={klacht && <KlachtenDetailContent klacht={klacht} />}
      breadcrumbs={breadcrumbs}
    />
  );
}
