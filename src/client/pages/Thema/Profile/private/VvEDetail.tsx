import { Paragraph } from '@amsterdam/design-system-react';

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
import { themaId } from '../../Afis/Afis-thema-config.ts';

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
          Hier ziet u data afkomsting uit de Basisregistratie Adressen en
          Gebouwen van het kadaster. Deze data kan een week achterlopen.
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
      themaId={themaId}
      title="Vereniging van Eigenaren"
      zaak={{}} // empty object to prevent info block: "Geen gegevens gevonden"
      isError={isError}
      isLoading={isLoading}
      pageContentMain={vve && <VveDetail vve={vve} />}
      breadcrumbs={breadcrumbs}
    />
  );
}
