import { Link, Paragraph } from '@amsterdam/design-system-react';

import { useProfileData } from './useProfileData.hook.tsx';
import { useWonenThemaData } from './useWonenThemaData.hook.ts';
import type { VvEDataFrontend } from '../../../../../server/services/wonen/zwd.types.ts';
import {
  Datalist,
  type Row,
  type RowSet,
} from '../../../../components/Datalist/Datalist.tsx';
import { PageContentCell } from '../../../../components/Page/Page.tsx';
import ThemaDetailPagina from '../../../../components/Thema/ThemaDetailPagina.tsx';
import { useHTMLDocumentTitle } from '../../../../hooks/useHTMLDocumentTitle.ts';
import { themaIdBRP } from '../Profile-thema-config.ts';

type VveDetailsProps = {
  vve: VvEDataFrontend;
};

function VveDetail({ vve }: VveDetailsProps) {
  const rows: Array<Row | RowSet> = [
    {
      label: 'Statutaire naam',
      content: vve.name,
    },
    {
      label: 'Aantal wooneenheden in de VvE',
      content: vve.numberOfApartments,
    },
    {
      label: 'Bouwjaar',
      content: vve.buildYear,
    },
    {
      label: 'Beschermd stads-/dorpsgezicht',
      content: vve.beschermdStadsdorpsgezicht,
    },
    {
      label: 'KvK nummer',
      content: vve.kvkNummer || null,
    },
    {
      label: 'Monumentstatus',
      content: vve.monumentStatus ? 'Ja' : 'Nee',
    },
  ].filter((row) => !!row.content);

  return (
    <>
      <PageContentCell spanWide={8}>
        <Paragraph>
          Hieronder staan de gegevens van uw Vereniging van Eigenaren (VvE){' '}
          zoals wij die hebben. Geef aan ons door als gegevens niet kloppen. Op{' '}
          <Link
            href="https://www.amsterdam.nl/stelselpedia/terugmelden/"
            rel="noopener noreferrer"
          >
            Terugmelden op basisgegevens en stelselrelaties
          </Link>{' '}
          leest u hoe u dit doet.
        </Paragraph>
      </PageContentCell>
      <PageContentCell>
        <Datalist rows={rows} />
      </PageContentCell>
    </>
  );
}

export function VvEDetail() {
  const { vve, isLoading, isError, breadcrumbs } = useWonenThemaData();
  const { routeConfig } = useProfileData();
  useHTMLDocumentTitle(routeConfig.detailPageVvE);
  return (
    <ThemaDetailPagina
      themaId={themaIdBRP}
      title="Vereniging van Eigenaren"
      zaak={{}} // empty object to prevent info block: "Geen gegevens gevonden"
      isError={isError}
      isLoading={isLoading}
      pageContentMain={vve && <VveDetail vve={vve} />}
      breadcrumbs={breadcrumbs}
    />
  );
}
