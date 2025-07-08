import { AanbiedenDienstenEnStraatartiestenContent } from './detail-page-content/AanbiedenDienstenEnStraatartiesten.tsx';
import { ERVV } from './detail-page-content/ERVV.tsx';
import { EvenementMelding } from './detail-page-content/EvenementMelding.tsx';
import { EvenementVergunning } from './detail-page-content/EvenementVergunning.tsx';
import { Flyeren } from './detail-page-content/Flyeren.tsx';
import { Nachtwerkontheffing } from './detail-page-content/Nachtwerkontheffing.tsx';
import { Omzettingsvergunning } from './detail-page-content/Omzettingsvergunning.tsx';
import { RvvHeleStad } from './detail-page-content/RvvHeleStad.tsx';
import { RvvSloterweg } from './detail-page-content/RvvSloterweg.tsx';
import { TVMRVVObject } from './detail-page-content/TVMRVVObject.tsx';
import { VergunningDetailDocumentsList } from './detail-page-content/VergunningDetailDocumentsList.tsx';
import { VOB } from './detail-page-content/VOB.tsx';
import { Woonvergunningen } from './detail-page-content/Woonvergunningen.tsx';
import { WVOSContent } from './detail-page-content/WVOS.tsx';
import { ZwaarVerkeer } from './detail-page-content/ZwaarVerkeer.tsx';
import { useVergunningenDetailData } from './useVergunningenDetailData.hook.ts';
import { useVergunningenThemaData } from './useVergunningenThemaData.hook.ts';
import type {
  DecosVergunning,
  VergunningFrontend,
} from '../../../../server/services/vergunningen/config-and-types.ts';
import { Datalist } from '../../../components/Datalist/Datalist.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

interface DetailPageContentProps<V> {
  vergunning: V;
}

// TODO: Implement detailpages per case
function DetailPageContent<T extends DecosVergunning>({
  vergunning,
}: DetailPageContentProps<VergunningFrontend<T>>) {
  return (
    <PageContentCell>
      {(function VergunningDetailContent() {
        switch (vergunning.caseType) {
          case 'TVM - RVV - Object':
            return <TVMRVVObject vergunning={vergunning} />;
          case 'Evenement melding':
            return <EvenementMelding vergunning={vergunning} />;
          case 'Evenement vergunning':
            return <EvenementVergunning vergunning={vergunning} />;
          case 'Omzettingsvergunning':
            return <Omzettingsvergunning vergunning={vergunning} />;
          case 'E-RVV - TVM':
            return <ERVV vergunning={vergunning} />;
          case 'Flyeren-Sampling':
            return <Flyeren vergunning={vergunning} />;
          case 'Straatartiesten':
          case 'Aanbieden van diensten':
            return (
              <AanbiedenDienstenEnStraatartiestenContent
                vergunning={vergunning}
              />
            );
          case 'Nachtwerkontheffing':
            return <Nachtwerkontheffing vergunning={vergunning} />;
          case 'Zwaar verkeer':
            return <ZwaarVerkeer vergunning={vergunning} />;
          case 'Samenvoegingsvergunning':
          case 'Onttrekkingsvergunning voor ander gebruik':
          case 'Onttrekkingsvergunning voor sloop':
          case 'Woningvormingsvergunning':
          case 'Splitsingsvergunning':
            return <Woonvergunningen vergunning={vergunning} />;
          case 'VOB':
            return <VOB vergunning={vergunning} />;
          case 'RVV - Hele stad':
            return <RvvHeleStad vergunning={vergunning} />;
          case 'RVV Sloterweg':
            return <RvvSloterweg vergunning={vergunning} />;
          case 'Werk en vervoer op straat':
            return <WVOSContent vergunning={vergunning} />;

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

export function VergunningenDetail() {
  const { vergunningen, isLoading, isError, breadcrumbs, routeConfig } =
    useVergunningenThemaData();
  const {
    vergunning,
    title = 'Vergunning',
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
            <DetailPageContent
              vergunning={vergunning as VergunningFrontend<DecosVergunning>}
            />
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

export const forTesting = {
  DetailPageContent,
};
