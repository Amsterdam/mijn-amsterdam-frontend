import { useParams } from 'react-router-dom';
import useSWR from 'swr';

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
import { VergunningFrontendV2 } from '../../../server/services/vergunningen/config-and-types';
import {
  ApiResponse,
  isError,
  isLoading,
} from '../../../universal/helpers/api';
import { GenericDocument } from '../../../universal/types';
import { CaseTypeV2 } from '../../../universal/types/decos-zaken';
import { Datalist } from '../../components/Datalist/Datalist';
import DocumentListV2 from '../../components/DocumentList/DocumentListV2';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';
import { WVOSContent } from './detail-page-content/WVOS';
import { PageContentCell } from '../../components/Page/Page';
import { useAppStateGetter } from '../../hooks/useAppState';

const ONE_MINUTE_MS = 60000;
// eslint-disable-next-line no-magic-numbers
const FIFTEEN_MINUTES_MS = 15 * ONE_MINUTE_MS;

interface DetailPageContentProps {
  vergunning: VergunningFrontendV2;
  documents: GenericDocument[];
  backLink: string;
}

// TODO: Implement detailpages per case
function DetailPageContent({ vergunning, documents }: DetailPageContentProps) {
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
      {!!documents.length && <DocumentListV2 documents={documents} />}
    </PageContentCell>
  );
}

interface VergunningV2DetailProps {
  backLink: string;
}

export function VergunningDetailPagina({ backLink }: VergunningV2DetailProps) {
  const appState = useAppStateGetter();
  const { VERGUNNINGEN } = appState;
  const { id } = useParams<{ id: VergunningFrontendV2['id'] }>();
  const vergunning = VERGUNNINGEN.content?.find((item) => item.id === id);
  const fetchDocumentsUrl = vergunning?.fetchDocumentsUrl;

  const { data: vergunningDocumentsResponse } = useSWR<
    ApiResponse<GenericDocument[]>
  >(
    fetchDocumentsUrl,
    (url: string) =>
      fetch(url, { credentials: 'include' }).then((response) =>
        response.json()
      ),

    { dedupingInterval: FIFTEEN_MINUTES_MS }
  );
  const vergunningDocuments = vergunningDocumentsResponse?.content ?? [];

  return (
    <ThemaDetailPagina<VergunningFrontendV2>
      title={vergunning?.title ?? 'Vergunning'}
      zaak={vergunning}
      isError={isError(VERGUNNINGEN)}
      isLoading={isLoading(VERGUNNINGEN)}
      pageContentTop={
        vergunning && (
          <DetailPageContent
            vergunning={vergunning}
            documents={vergunningDocuments}
            backLink={backLink}
          />
        )
      }
      backLink={backLink}
      documentPathForTracking={(document) =>
        `/downloads/vergunningen/${vergunning?.caseType}/${document.title.split(/\n/)[0]}`
      }
    />
  );
}
