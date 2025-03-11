import { BZB } from './detail-page-content/BZB';
import { BZP } from './detail-page-content/BZP';
import { EigenParkeerplaatsOpheffen } from './detail-page-content/EigenParkeerplaatsOpheffen';
import { GPK } from './detail-page-content/GPK';
import { GPPContent } from './detail-page-content/GPP';
import { useParkerenData } from './useParkerenData.hook';
import { DecosParkeerVergunning } from '../../../server/services/parkeren/config-and-types';
import { VergunningFrontend } from '../../../server/services/vergunningen/config-and-types';
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

export function ParkerenDetailPagina() {
  const { vergunningen, isLoading, isError, themaPaginaBreadcrumb } =
    useParkerenData();
  const { vergunning, title, documents } =
    useVergunningenDetailData(vergunningen);

  return (
    <ThemaDetailPagina<VergunningFrontend<DecosParkeerVergunning>>
      title={title}
      zaak={vergunning}
      isError={isError}
      isLoading={isLoading}
      pageContentMain={
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
