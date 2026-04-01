import { Paragraph } from '@amsterdam/design-system-react';

import { useProfileData } from './useProfileData.hook';
import { useWonenThemaData } from './useWonenThemaData.hook';
import { VvEDataSource } from '../../../../../server/services/wonen/zwd.types';
import {
  Datalist,
  Row,
  RowSet,
} from '../../../../components/Datalist/Datalist';
import { PageContentCell } from '../../../../components/Page/Page';
import ThemaDetailPagina from '../../../../components/Thema/ThemaDetailPagina';
import { useHTMLDocumentTitle } from '../../../../hooks/useHTMLDocumentTitle';
import { themaId } from '../../Afis/Afis-thema-config';

type WonenDataProps = {
  vve: VvEDataSource;
};

function WonenData({ vve }: WonenDataProps) {
  const rows: Array<Row | RowSet> = [
    vve?.name !== null && {
      label: 'Statutaire naam',
      content: vve?.name,
    },
    vve?.number_of_apartments !== null && {
      label: 'Aantal wooneenheden in de VvE',
      content: vve?.number_of_apartments,
    },
    vve?.build_year !== null && {
      label: 'Bouwjaar',
      content: vve?.build_year,
    },
    vve?.beschermd_stadsdorpsgezicht !== null && {
      label: 'Beschermd stads-/dorpsgezicht',
      content: vve?.beschermd_stadsdorpsgezicht,
    },
    vve?.is_priority_neighborhood !== null && {
      label: 'Prioriteitswijk',
      content: vve?.is_priority_neighborhood ? 'Ja' : 'Nee',
    },
    (vve?.kvk_nummer !== null ||
      vve?.kvk_nummer !== undefined ||
      vve?.kvk_nummer !== '') && {
      label: 'KvK-nummer',
      content: vve?.kvk_nummer,
    },
    vve?.monument_status !== null && {
      label: 'Monumentstatus',
      content: vve?.monument_status,
    },
  ].filter((row) => !!row);

  return (
    <>
      <PageContentCell>
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
  const { wonenData, isLoading, isError, breadcrumbs } = useWonenThemaData();
  const { routeConfig } = useProfileData();
  useHTMLDocumentTitle(routeConfig.detailPageVvE);
  return (
    <ThemaDetailPagina
      themaId={themaId}
      title="Vereniging van Eigenaren"
      zaak={{}} // empty object to prevent info block: "Geen gegevens gevonden"
      isError={isError}
      isLoading={isLoading}
      pageContentMain={wonenData && <WonenData vve={wonenData} />}
      breadcrumbs={breadcrumbs}
    />
  );
}
