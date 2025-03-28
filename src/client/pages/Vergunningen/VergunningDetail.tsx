import { AanbiedenDienstenContent } from './detail-page-content/AanbiedenDiensten';
import { BZB } from './detail-page-content/BZB';
import { BZP } from './detail-page-content/BZP';
import { EigenParkeerplaatsOpheffen } from './detail-page-content/EigenParkeerplaatsOpheffen';
import { ERVV } from './detail-page-content/ERVV';
import { EvenementMelding } from './detail-page-content/EvenementMelding';
import { EvenementVergunning } from './detail-page-content/EvenementVergunning';
import { Flyeren } from './detail-page-content/Flyeren';
import { GPK } from './detail-page-content/GPK';
import { GPPContent } from './detail-page-content/GPP';
import { Nachtwerkontheffing } from './detail-page-content/Nachtwerkontheffing';
import { Omzettingsvergunning } from './detail-page-content/Omzettingsvergunning';
import { RvvHeleStad } from './detail-page-content/RvvHeleStad';
import { RvvSloterweg } from './detail-page-content/RvvSloterweg';
import { Touringcar } from './detail-page-content/Touringcar';
import { TVMRVVObject } from './detail-page-content/TVMRVVObject';
import { VOB } from './detail-page-content/VOB';
import { Woonvergunningen } from './detail-page-content/Woonvergunningen';
import { ZwaarVerkeer } from './detail-page-content/ZwaarVerkeer';
import { useVergunningenDetailData } from './useVergunningenDetailData.hook';
import { useVergunningenThemaData } from './useVergunningenThemaData.hook';
import { VergunningFrontend } from '../../../server/services/vergunningen/config-and-types';
import { CaseTypeV2 } from '../../../universal/types/decos-zaken';
import { Datalist } from '../../components/Datalist/Datalist';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';
import { WVOSContent } from './detail-page-content/WVOS';
import DocumentListV2 from '../../components/DocumentList/DocumentListV2';
import { PageContentCell } from '../../components/Page/Page';

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
          case CaseTypeV2.TVMRVVObject:
            return <TVMRVVObject vergunning={vergunning} />;
          case CaseTypeV2.GPK:
            return <GPK vergunning={vergunning} />;
          case CaseTypeV2.GPP:
            return <GPPContent vergunning={vergunning} />;
          case CaseTypeV2.EvenementMelding:
            return <EvenementMelding vergunning={vergunning} />;
          case CaseTypeV2.EvenementVergunning:
            return <EvenementVergunning vergunning={vergunning} />;
          case CaseTypeV2.Omzettingsvergunning:
            return <Omzettingsvergunning vergunning={vergunning} />;
          case CaseTypeV2.ERVV:
            return <ERVV vergunning={vergunning} />;
          case CaseTypeV2.BZP:
            return <BZP vergunning={vergunning} />;
          case CaseTypeV2.BZB:
            return <BZB vergunning={vergunning} />;
          case CaseTypeV2.Flyeren:
            return <Flyeren vergunning={vergunning} />;
          case CaseTypeV2.AanbiedenDiensten:
            return <AanbiedenDienstenContent vergunning={vergunning} />;
          case CaseTypeV2.NachtwerkOntheffing:
            return <Nachtwerkontheffing vergunning={vergunning} />;
          case CaseTypeV2.ZwaarVerkeer:
            return <ZwaarVerkeer vergunning={vergunning} />;
          case CaseTypeV2.Samenvoegingsvergunning:
          case CaseTypeV2.Onttrekkingsvergunning:
          case CaseTypeV2.OnttrekkingsvergunningSloop:
          case CaseTypeV2.VormenVanWoonruimte:
          case CaseTypeV2.Splitsingsvergunning:
            return <Woonvergunningen vergunning={vergunning} />;
          case CaseTypeV2.VOB:
            return <VOB vergunning={vergunning} />;
          case CaseTypeV2.RVVHeleStad:
            return <RvvHeleStad vergunning={vergunning} />;
          case CaseTypeV2.RVVSloterweg:
            return <RvvSloterweg vergunning={vergunning} />;
          case CaseTypeV2.EigenParkeerplaats:
            return <EigenParkeerplaatsOpheffen vergunning={vergunning} />;
          case CaseTypeV2.EigenParkeerplaatsOpheffen:
            return <EigenParkeerplaatsOpheffen vergunning={vergunning} />;
          case CaseTypeV2.TouringcarDagontheffing:
          case CaseTypeV2.TouringcarJaarontheffing:
            return <Touringcar vergunning={vergunning} />;
          case CaseTypeV2.WVOS:
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

interface VergunningV2DetailProps {
  backLink: string;
}

export function VergunningDetailPagina({ backLink }: VergunningV2DetailProps) {
  const { vergunningen, isLoading, isError } = useVergunningenThemaData();
  const { vergunning, title, documents } =
    useVergunningenDetailData(vergunningen);

  return (
    <ThemaDetailPagina<VergunningFrontend>
      title={title}
      zaak={vergunning}
      isError={isError}
      isLoading={isLoading}
      pageContentTop={
        vergunning && (
          <>
            <DetailPageContent vergunning={vergunning} backLink={backLink} />
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
                          className="ams-mb--sm"
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
      backLink={backLink}
    />
  );
}
