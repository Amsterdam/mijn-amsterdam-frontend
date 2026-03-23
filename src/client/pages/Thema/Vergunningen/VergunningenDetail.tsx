import { AanbiedenDienstenEnStraatartiestenContent } from './detail-page-content/AanbiedenDienstenEnStraatartiesten.tsx';
import { ERVV } from './detail-page-content/ERVV.tsx';
import { EvenementMelding } from './detail-page-content/EvenementMelding.tsx';
import { EvenementVergunning } from './detail-page-content/EvenementVergunning.tsx';
import { Flyeren } from './detail-page-content/Flyeren.tsx';
import { LigplaatsVergunning } from './detail-page-content/LigplaatsVergunning.tsx';
import { Nachtwerkontheffing } from './detail-page-content/Nachtwerkontheffing.tsx';
import { Omzettingsvergunning } from './detail-page-content/Omzettingsvergunning.tsx';
import { RvvHeleStad } from './detail-page-content/RvvHeleStad.tsx';
import { RvvSloterweg } from './detail-page-content/RvvSloterweg.tsx';
import { TVMRVVObject } from './detail-page-content/TVMRVVObject.tsx';
import { VergunningDetailDocumentsList } from './detail-page-content/VergunningDetailDocumentsList.tsx';
import { Woonvergunningen } from './detail-page-content/Woonvergunningen.tsx';
import { WVOSContent } from './detail-page-content/WVOS.tsx';
import { ZwaarVerkeer } from './detail-page-content/ZwaarVerkeer.tsx';
import { useVergunningenDetailData } from './useVergunningenDetailData.hook.ts';
import { useVergunningenThemaData } from './useVergunningenThemaData.hook.ts';
import type { DecosZaakFrontend } from '../../../../server/services/decos/decos-types.ts';
import type { PowerBrowserZaakFrontend } from '../../../../server/services/powerbrowser/powerbrowser-types.ts';
import type {
  DecosVergunning,
  PBVergunning,
  ZaakFrontendCombined,
} from '../../../../server/services/vergunningen/config-and-types.ts';
import { Datalist } from '../../../components/Datalist/Datalist.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

interface DetailPageContentProps<V> {
  vergunning: V;
}

function DetailPageContent<T extends DecosVergunning | PBVergunning>({
  vergunning,
}: DetailPageContentProps<
  T extends DecosVergunning
    ? DecosZaakFrontend<T>
    : T extends PBVergunning
      ? PowerBrowserZaakFrontend<T>
      : never
>) {
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
          case 'Voorraadvergunning tweede woning':
          case 'Splitsingsvergunning':
            return <Woonvergunningen vergunning={vergunning} />;
          case 'VOB':
          case 'Ligplaatsvergunning woonboot':
          case 'Ligplaatsvergunning bedrijfsvaartuig':
            return <LigplaatsVergunning vergunning={vergunning} />;
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
  const {
    vergunningen,
    id: themaId,
    isLoading,
    isError,
    breadcrumbs,
    themaConfig,
  } = useVergunningenThemaData();
  const {
    vergunning,
    title = 'Vergunning',
    documents,
    isLoadingDocuments,
    isErrorDocuments,
  } = useVergunningenDetailData(vergunningen);
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
            <DetailPageContent
              vergunning={
                vergunning as ZaakFrontendCombined<
                  DecosVergunning | PBVergunning
                >
              }
            />
            <PageContentCell spanWide={8}>
              <VergunningDetailDocumentsList
                isLoading={isLoadingDocuments}
                isError={isErrorDocuments}
                documents={documents}
                vergunning={
                  vergunning as ZaakFrontendCombined<
                    DecosVergunning | PBVergunning
                  >
                }
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
