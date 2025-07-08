import { useHorecaThemaData } from './useHorecaThemaData.hook.ts';
import {
  DecosZaakExploitatieHorecabedrijf,
  HorecaVergunningFrontend,
} from '../../../../server/services/horeca/decos-zaken.ts';
import { VergunningFrontend } from '../../../../server/services/vergunningen/config-and-types.ts';
import { Datalist } from '../../../components/Datalist/Datalist.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';
import {
  commonTransformers,
  getRows,
} from '../Vergunningen/detail-page-content/fields-config.tsx';
import { VergunningDetailDocumentsList } from '../Vergunningen/detail-page-content/VergunningDetailDocumentsList.tsx';
import { useVergunningenDetailData } from '../Vergunningen/useVergunningenDetailData.hook.ts';

type ExploitatieHorecaBedrijfProps = {
  vergunning: VergunningFrontend<DecosZaakExploitatieHorecabedrijf>;
};

function ExploitatieHorecaBedrijf({
  vergunning,
}: ExploitatieHorecaBedrijfProps) {
  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    commonTransformers.location,
    () =>
      vergunning.processed && vergunning.dateEnd && vergunning.dateStart
        ? commonTransformers.dateRange(vergunning)
        : null,
    ,
    commonTransformers.decision,
  ]);

  return <Datalist rows={rows} />;
}

export function HorecaDetail() {
  const { vergunningen, isLoading, isError, breadcrumbs, routeConfig } =
    useHorecaThemaData();
  const {
    vergunning,
    title = 'Horecavergunning',
    documents,
    isLoadingDocuments,
    isErrorDocuments,
  } = useVergunningenDetailData<HorecaVergunningFrontend>(vergunningen);
  useHTMLDocumentTitle(routeConfig.detailPage);

  return (
    <ThemaDetailPagina
      title={title}
      zaak={vergunning}
      isError={isError}
      isLoading={isLoading}
      pageContentMain={
        vergunning && (
          <>
            <PageContentCell>
              <ExploitatieHorecaBedrijf vergunning={vergunning} />
            </PageContentCell>
            <PageContentCell spanWide={8}>
              <VergunningDetailDocumentsList
                isLoading={isLoadingDocuments}
                isError={isErrorDocuments}
                documents={documents}
              />
            </PageContentCell>
          </>
        )
      }
      breadcrumbs={breadcrumbs}
    />
  );
}
