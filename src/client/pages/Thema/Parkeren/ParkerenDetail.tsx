import { BZB } from './detail-page-content/BZB.tsx';
import { BZP } from './detail-page-content/BZP.tsx';
import { EigenParkeerplaats } from './detail-page-content/EigenParkeerplaats.tsx';
import { EigenParkeerplaatsOpheffen } from './detail-page-content/EigenParkeerplaatsOpheffen.tsx';
import { GPK } from './detail-page-content/GPK.tsx';
import { GPPContent } from './detail-page-content/GPP.tsx';
import { Touringcar } from './detail-page-content/Touringcar.tsx';
import { useParkerenData } from './useParkerenData.hook.tsx';
import { DecosParkeerVergunning } from '../../../../server/services/parkeren/config-and-types.ts';
import { VergunningFrontend } from '../../../../server/services/vergunningen/config-and-types.ts';
import { Datalist } from '../../../components/Datalist/Datalist.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';
import { VergunningDetailDocumentsList } from '../Vergunningen/detail-page-content/VergunningDetailDocumentsList.tsx';
import { useVergunningenDetailData } from '../Vergunningen/useVergunningenDetailData.hook.ts';

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
  const { vergunningen, isLoading, isError, breadcrumbs, routeConfig } =
    useParkerenData();
  const {
    vergunning,
    title = 'Parkeervergunning of ontheffing',
    documents,
    isLoadingDocuments,
    isErrorDocuments,
  } = useVergunningenDetailData(vergunningen);
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
