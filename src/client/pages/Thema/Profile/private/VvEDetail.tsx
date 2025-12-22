import { useProfileData } from './useProfileData.hook';
import { useWonenThemaData } from './useVvEThemaData.hook';
import type { VvEDataFrontend } from '../../../../../server/services/wonen/zwd-vve.types';
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
  vve: VvEDataFrontend;
};

function WonenData({ vve }: WonenDataProps) {
  const rows: Array<Row | RowSet> = [
    {
      label: 'Aantal wooneenheden in de VvE',
      content: vve?.number_of_apartments ?? '-',
    },
    {
      label: 'Bouwjaar',
      content: vve?.build_year ?? '-',
    },
    {
      label: 'Beschermd stads-/dorpsgezicht',
      content: vve?.beschermd_stadsdorpsgezicht ?? '-',
    },

    // {
    //   label: 'Stadsdeel',
    //   content: vve?.district ?? '-',
    // },
    // {
    //   label: 'VvE ID
    //   content: vve?.id ?? '-',
    // },
    {
      label: 'Prioriteitswijk',
      content: vve?.is_priority_neighborhood ? 'Ja' : 'Nee',
    },
    {
      label: 'Kleine VvE',
      content: vve?.is_small ? 'Ja' : 'Nee',
    },
    {
      label: 'KvK-nummer',
      content: vve?.kvk_nummer ?? '-',
    },
    {
      label: 'Ligt in beschermd gebied',
      content: vve?.ligt_in_beschermd_gebied ?? '-',
    },
    {
      label: 'Monumentstatus',
      content: vve?.monument_status ?? '-',
    },
    // {
    //   label: 'Buurt',
    //   content: vve?.neighborhood ?? '-',
    // },
    // {
    //   label: 'Wijk',
    //   content: vve?.wijk ?? '-',
    // },
    // {
    //   label: 'Postcode',
    //   content: vve?.zip_code ?? '-',
    // },
  ].filter((row) => !!row.content);

  return (
    <PageContentCell>
      <Datalist rows={rows} />
    </PageContentCell>
  );
}

export function WonenDetail() {
  const { wonenData, isLoading, isError, breadcrumbs } = useWonenThemaData();
  const { routeConfig } = useProfileData();
  useHTMLDocumentTitle(routeConfig.detailPageVvE);
  return (
    <ThemaDetailPagina
      themaId={themaId}
      title={wonenData?.name || 'VvE'}
      zaak={{}} // empty object to prevent info block: "Geen gegevens gevonden"
      isError={isError}
      isLoading={isLoading}
      pageContentMain={wonenData && <WonenData vve={wonenData} />}
      breadcrumbs={breadcrumbs}
    />
  );
}
