import { useParams } from 'react-router';

import { useKlachtenThemaData } from './useKlachtenThemaData.hook';
import type { Klacht } from '../../../server/services/klachten/types';
import { Datalist, Row, RowSet } from '../../components/Datalist/Datalist';
import { PageContentCell } from '../../components/Page/Page';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';

type KlachtenDetailContentProps = {
  klacht: Klacht;
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

export function KlachtenDetailPagina() {
  const { klachten, isLoading, isError, breadcrumbs } = useKlachtenThemaData();
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
