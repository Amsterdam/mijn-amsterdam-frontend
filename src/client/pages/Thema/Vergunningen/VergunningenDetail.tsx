import { AanbiedenDienstenEnStraatartiestenContent } from './detail-page-content/AanbiedenDienstenEnStraatartiesten';
import { ERVV } from './detail-page-content/ERVV';
import { EvenementMelding } from './detail-page-content/EvenementMelding';
import { EvenementVergunning } from './detail-page-content/EvenementVergunning';
import { Flyeren } from './detail-page-content/Flyeren';
import { Nachtwerkontheffing } from './detail-page-content/Nachtwerkontheffing';
import { Omzettingsvergunning } from './detail-page-content/Omzettingsvergunning';
import { RvvHeleStad } from './detail-page-content/RvvHeleStad';
import { RvvSloterweg } from './detail-page-content/RvvSloterweg';
import { TVMRVVObject } from './detail-page-content/TVMRVVObject';
import { VergunningDetailDocumentsList } from './detail-page-content/VergunningDetailDocumentsList';
import { VOB } from './detail-page-content/VOB';
import { Woonvergunningen } from './detail-page-content/Woonvergunningen';
import { WVOSContent } from './detail-page-content/WVOS';
import { ZwaarVerkeer } from './detail-page-content/ZwaarVerkeer';
import { useVergunningenDetailData } from './useVergunningenDetailData.hook';
import { useVergunningenThemaData } from './useVergunningenThemaData.hook';
import { VergunningFrontend } from '../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../components/Datalist/Datalist';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';

interface DetailPageContentProps<V> {
  vergunning: V;
}

// TODO: Implement detailpages per case
function DetailPageContent<V extends VergunningFrontend>({
  vergunning,
}: DetailPageContentProps<V>) {
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
  const { vergunningen, isLoading, isError, breadcrumbs } =
    useVergunningenThemaData();
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

export const forTesting = {
  DetailPageContent,
};
