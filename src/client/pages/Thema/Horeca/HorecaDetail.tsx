import { useHorecaThemaData } from './useHorecaThemaData.hook';
import {
  DecosZaakExploitatieHorecabedrijf,
  HorecaVergunningFrontend,
} from '../../../../server/services/horeca/decos-zaken';
import { VergunningFrontend } from '../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../components/Datalist/Datalist';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';
import {
  commonTransformers,
  getRows,
} from '../Vergunningen/detail-page-content/fields-config';
import { VergunningDetailDocumentsList } from '../Vergunningen/detail-page-content/VergunningDetailDocumentsList';
import { useVergunningenDetailData } from '../Vergunningen/useVergunningenDetailData.hook';

type ExploitatieHorecaBedrijfProps = {
  vergunning: VergunningFrontend<DecosZaakExploitatieHorecabedrijf>;
};

function ExploitatieHorecaBedrijf({
  vergunning,
}: ExploitatieHorecaBedrijfProps) {
  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    commonTransformers.location,
    {
      label: 'Begindatum',
      content: vergunning.dateStartFormatted,
      isVisible: vergunning.processed && vergunning.decision === 'Verleend',
    },
    commonTransformers.decision,
  ]);

  return <Datalist rows={rows} />;
}

export function HorecaDetail() {
  const { vergunningen, isLoading, isError, breadcrumbs, routeConfig } =
    useHorecaThemaData();
  const { vergunning, title, documents, isLoadingDocuments, isErrorDocuments } =
    useVergunningenDetailData<HorecaVergunningFrontend>(vergunningen);
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
