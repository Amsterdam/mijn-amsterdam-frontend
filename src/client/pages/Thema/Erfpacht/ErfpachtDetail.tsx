import { DataTableBijzondereBepalingen } from './DossierDetail/DatalistBijzondereBepalingen';
import { DatalistGeneral } from './DossierDetail/DatalistGeneral';
import { DatalistJuridisch } from './DossierDetail/DatalistJuridisch';
import { DatalistsFinancieel } from './DossierDetail/DatalistsFinancieel';
import { useDossierData as useDossierDetailData } from './DossierDetail/useErfpachtDossierData.hook';
import { CollapsiblePanel } from '../../../components/CollapsiblePanel/CollapsiblePanel';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

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
    routeConfig,
  } = useDossierDetailData();
  useHTMLDocumentTitle(routeConfig.detailPage);

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
                <DatalistGeneral dossier={dossier} relatieCode={relatieCode} />
              </PageContentCell>

              <PageContentCell>
                <CollapsiblePanel title={dossier.titelKopJuridisch}>
                  <DatalistJuridisch dossier={dossier} />
                </CollapsiblePanel>
              </PageContentCell>

              <PageContentCell>
                <CollapsiblePanel title={dossier.titelKopBijzondereBepalingen}>
                  <DataTableBijzondereBepalingen dossier={dossier} />
                </CollapsiblePanel>
              </PageContentCell>

              <PageContentCell>
                <CollapsiblePanel title={dossier.titelKopFinancieel}>
                  <DatalistsFinancieel dossier={dossier} />
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
