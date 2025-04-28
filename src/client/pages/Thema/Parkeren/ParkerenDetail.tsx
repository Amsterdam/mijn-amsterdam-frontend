import { BZB } from './detail-page-content/BZB';
import { BZP } from './detail-page-content/BZP';
import { EigenParkeerplaats } from './detail-page-content/EigenParkeerplaats';
import { EigenParkeerplaatsOpheffen } from './detail-page-content/EigenParkeerplaatsOpheffen';
import { GPK } from './detail-page-content/GPK';
import { GPPContent } from './detail-page-content/GPP';
import { Touringcar } from './detail-page-content/Touringcar';
import { useParkerenData } from './useParkerenData.hook';
import { DecosParkeerVergunning } from '../../../../server/services/parkeren/config-and-types';
import { VergunningFrontend } from '../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../components/Datalist/Datalist';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';
import { VergunningDetailDocumentsList } from '../Vergunningen/detail-page-content/VergunningDetailDocumentsList';
import { useVergunningenDetailData } from '../Vergunningen/useVergunningenDetailData.hook';

interface DetailPageContentProps<V> {
  vergunning: V;
}

// TODO: Implement detailpages per case
function DetailPageContent<
  V extends VergunningFrontend<DecosParkeerVergunning>,
>({ vergunning }: DetailPageContentProps<V>) {
  return (
    <PageContentCell>
      {(function VergunningDetailContent() {
        switch (vergunning.caseType) {
          case 'GPK':
            return <GPK vergunning={vergunning} />;
          case 'GPP':
            return <GPPContent vergunning={vergunning} />;
          case 'Parkeerontheffingen Blauwe zone particulieren':
            return <BZP vergunning={vergunning} />;
          case 'Parkeerontheffingen Blauwe zone bedrijven':
            return <BZB vergunning={vergunning} />;
          case 'Eigen parkeerplaats':
            return <EigenParkeerplaats vergunning={vergunning} />;
          case 'Eigen parkeerplaats opheffen':
            return <EigenParkeerplaatsOpheffen vergunning={vergunning} />;
          case 'Touringcar Dagontheffing':
          case 'Touringcar Jaarontheffing':
            return <Touringcar vergunning={vergunning} />;

          default:
            return (
              <Datalist
                rows={Object.entries(vergunning).map(([label, content]) => ({
                  label,
                  content: JSON.stringify(content),
                }))}
              />
            );
        }
      })()}
    </PageContentCell>
  );
}

export function ParkerenDetail() {
  const { vergunningen, isLoading, isError, breadcrumbs } = useParkerenData();
  const { vergunning, title, documents, isLoadingDocuments, isErrorDocuments } =
    useVergunningenDetailData(vergunningen);

  return (
    <ThemaDetailPagina
      title={title}
      zaak={vergunning}
      isError={isError}
      isLoading={isLoading}
      pageContentMain={
        vergunning && (
          <>
            <DetailPageContent vergunning={vergunning} />
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
