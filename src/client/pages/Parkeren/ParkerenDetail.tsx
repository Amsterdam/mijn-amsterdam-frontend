import { BZB } from './detail-page-content/BZB';
import { BZP } from './detail-page-content/BZP';
import { EigenParkeerplaatsOpheffen } from './detail-page-content/EigenParkeerplaatsOpheffen';
import { GPK } from './detail-page-content/GPK';
import { GPPContent } from './detail-page-content/GPP';
import { useParkerenData } from './useParkerenData.hook';
import { DecosParkeerVergunning } from '../../../server/services/parkeren/config-and-types';
import { VergunningFrontend } from '../../../server/services/vergunningen/config-and-types';
import { CaseTypeV2 } from '../../../universal/types/decos-zaken';
import { Datalist } from '../../components/Datalist/Datalist';
import DocumentListV2 from '../../components/DocumentList/DocumentListV2';
import { PageContentCell } from '../../components/Page/Page';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';
import { Touringcar } from './detail-page-content/Touringcar';
import { useVergunningenDetailData } from '../Vergunningen/useVergunningenDetailData.hook';
import { EigenParkeerplaats } from './detail-page-content/EigenParkeerplaats';

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
          case CaseTypeV2.GPK:
            return <GPK vergunning={vergunning} />;
          case CaseTypeV2.GPP:
            return <GPPContent vergunning={vergunning} />;
          case CaseTypeV2.BZP:
            return <BZP vergunning={vergunning} />;
          case CaseTypeV2.BZB:
            return <BZB vergunning={vergunning} />;
          case CaseTypeV2.EigenParkeerplaats:
            return <EigenParkeerplaats vergunning={vergunning} />;
          case CaseTypeV2.EigenParkeerplaatsOpheffen:
            return <EigenParkeerplaatsOpheffen vergunning={vergunning} />;
          case CaseTypeV2.TouringcarDagontheffing:
          case CaseTypeV2.TouringcarJaarontheffing:
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

export function ParkerenDetailPagina() {
  const { vergunningen, isLoading, isError, routes } = useParkerenData();
  const { vergunning, title, documents } =
    useVergunningenDetailData(vergunningen);

  return (
    <ThemaDetailPagina<VergunningFrontend<DecosParkeerVergunning>>
      title={title}
      zaak={vergunning}
      isError={isError}
      isLoading={isLoading}
      pageContentTop={
        vergunning && (
          <>
            <DetailPageContent vergunning={vergunning} />
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
      backLink={routes.themePage}
    />
  );
}
