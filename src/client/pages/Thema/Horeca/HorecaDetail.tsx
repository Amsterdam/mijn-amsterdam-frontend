import { useHorecaThemaData } from './useHorecaThemaData.hook';
import {
  DecosZaakExploitatieHorecabedrijf,
  HorecaVergunningFrontend,
} from '../../../../server/services/horeca/decos-zaken';
import { DecosZaakFrontend } from '../../../../server/services/vergunningen/config-and-types';
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
  vergunning: DecosZaakFrontend<DecosZaakExploitatieHorecabedrijf>;
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
  const {
    vergunningen,
    themaId,
    isLoading,
    isError,
    breadcrumbs,
    themaConfig,
  } = useHorecaThemaData();
  const {
    vergunning,
    title = 'Horecavergunning',
    documents,
    isLoadingDocuments,
    isErrorDocuments,
  } = useVergunningenDetailData<HorecaVergunningFrontend>(vergunningen);
  useHTMLDocumentTitle(themaConfig.detailPage.route);

  return (
    <ThemaDetailPagina
      themaId={themaId}
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
