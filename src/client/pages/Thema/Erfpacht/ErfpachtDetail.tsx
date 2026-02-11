import { DataTableBijzondereBepalingen } from './DossierDetail/DatalistBijzondereBepalingen';
import { DatalistGeneral } from './DossierDetail/DatalistGeneral';
import { DatalistJuridisch } from './DossierDetail/DatalistJuridisch';
import { DatalistsFinancieel } from './DossierDetail/DatalistsFinancieel';
import { useDossierData as useDossierDetailData } from './DossierDetail/useErfpachtDossierData.hook';
import { CollapsiblePanel } from '../../../components/CollapsiblePanel/CollapsiblePanel';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';
import { useAfisThemaData } from '../Afis/useAfisThemaData.hook';

export function ErfpachtDetail() {
  const {
    dossier,
    isError,
    isLoading,
    isErrorThemaData,
    isLoadingThemaData,
    relatieCode,
    breadcrumbs,
    themaId,
    title,
    themaConfig,
  } = useDossierDetailData();
  const afis = useAfisThemaData();
  useHTMLDocumentTitle(themaConfig.detailPage.route);
  return (
    <ThemaDetailPagina
      themaId={themaId}
      title={title}
      zaak={dossier}
      isError={isError || isErrorThemaData}
      isLoading={isLoading || isLoadingThemaData}
      pageContentMain={
        <>
          {!!dossier && (
            <>
              <PageContentCell>
                <DatalistGeneral
                  dossier={dossier}
                  relatieCode={relatieCode}
                  debiteurNummer={afis.businessPartnerId}
                />
              </PageContentCell>

              <PageContentCell>
                <CollapsiblePanel title={dossier.titelKopJuridisch}>
                  <DatalistJuridisch
                    dossier={dossier}
                    debiteurNummer={afis.businessPartnerId}
                  />
                </CollapsiblePanel>
              </PageContentCell>

              <PageContentCell>
                <CollapsiblePanel title={dossier.titelKopBijzondereBepalingen}>
                  <DataTableBijzondereBepalingen
                    dossier={dossier}
                    debiteurNummer={afis.businessPartnerId}
                  />
                </CollapsiblePanel>
              </PageContentCell>

              <PageContentCell>
                <CollapsiblePanel title={dossier.titelKopFinancieel}>
                  <DatalistsFinancieel
                    dossier={dossier}
                    debiteurNummer={afis.businessPartnerId}
                  />
                </CollapsiblePanel>
              </PageContentCell>
            </>
          )}
        </>
      }
      breadcrumbs={breadcrumbs}
    />
  );
}
