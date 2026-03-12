import { useHorecaThemaData } from './useHorecaThemaData.hook.ts';
import type { DecosZaakExploitatieHorecabedrijf } from '../../../../server/services/horeca/decos-zaken.ts';
import type {
  DecosZaakFrontend,
  WithLocation,
  ZaakFrontendCombined,
} from '../../../../server/services/vergunningen/config-and-types.ts';
import { Datalist } from '../../../components/Datalist/Datalist.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';
import {
  commonTransformers,
  getRows,
  type VergunningDataListRow,
} from '../Vergunningen/detail-page-content/fields-config.tsx';
import { VergunningDetailDocumentsList } from '../Vergunningen/detail-page-content/VergunningDetailDocumentsList.tsx';
import { useVergunningenDetailData } from '../Vergunningen/useVergunningenDetailData.hook.ts';

type ExploitatieHorecaBedrijfProps = {
  vergunning: DecosZaakFrontend<DecosZaakExploitatieHorecabedrijf>;
};

function ExploitatieHorecaBedrijf({
  vergunning,
}: ExploitatieHorecaBedrijfProps) {
  const dateRangeConditional: VergunningDataListRow<
    ZaakFrontendCombined<DecosZaakExploitatieHorecabedrijf & WithLocation>
  > = (vergunning) =>
    vergunning.processed && vergunning.dateEnd && vergunning.dateStart
      ? commonTransformers.dateRange(vergunning)
      : null;

  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    commonTransformers.location,
    dateRangeConditional,
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
  } = useVergunningenDetailData<
    DecosZaakFrontend<DecosZaakExploitatieHorecabedrijf>
  >(vergunningen);
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
