import { useHorecaThemaData } from './useHorecaThemaData.hook';
import {
  DecosZaakExploitatieHorecabedrijf,
  HorecaVergunningFrontend,
} from '../../../server/services/horeca/config-and-types';
import { VergunningFrontend } from '../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../components/Datalist/Datalist';
import DocumentListV2 from '../../components/DocumentList/DocumentListV2';
import { PageContentCell } from '../../components/Page/Page';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';
import { getRows } from '../Vergunningen/detail-page-content/fields-config';
import { useVergunningenDetailData } from '../Vergunningen/useVergunningenDetailData.hook';

type ExploitatieHorecaBedrijfProps = {
  vergunning: VergunningFrontend<DecosZaakExploitatieHorecabedrijf>;
};

function ExploitatieHorecaBedrijf({
  vergunning,
}: ExploitatieHorecaBedrijfProps) {
  const rows = getRows(vergunning, [
    'identifier',
    'location',
    {
      dateStart: () => ({
        label: 'Begindatum',
        content: vergunning.dateStartFormatted,
        isVisible: vergunning.processed && vergunning.decision === 'Verleend',
      }),
    },
    'decision',
  ]);

  return <Datalist rows={rows} />;
}

export function HorecaDetailPagina() {
  const { vergunningen, isLoading, isError, themaPaginaBreadcrumb } =
    useHorecaThemaData();
  const { vergunning, title, documents } =
    useVergunningenDetailData<HorecaVergunningFrontend>(vergunningen);

  return (
    <ThemaDetailPagina<HorecaVergunningFrontend>
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
            {!!documents.length && (
              <PageContentCell spanWide={8}>
                <Datalist
                  rows={[
                    {
                      label: 'Documenten',
                      content: (
                        <DocumentListV2
                          documents={documents}
                          columns={['', '']}
                        />
                      ),
                    },
                  ]}
                />
              </PageContentCell>
            )}
          </>
        )
      }
      breadcrumbs={[themaPaginaBreadcrumb]}
    />
  );
}
