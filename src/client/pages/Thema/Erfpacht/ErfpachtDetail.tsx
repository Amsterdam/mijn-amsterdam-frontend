import { DataTableBijzondereBepalingen } from './DossierDetail/DatalistBijzondereBepalingen';
import { DatalistGeneral } from './DossierDetail/DatalistGeneral';
import { DatalistJuridisch } from './DossierDetail/DatalistJuridisch';
import { DatalistsFinancieel } from './DossierDetail/DatalistsFinancieel';
import { DataTableFacturen } from './DossierDetail/DataTableFacturen';
import { useDossierDetaiLData as useDossierDetailData } from './DossierDetail/erfpachtDossierData.hook';
import styles from './ErfpachtDetail.module.scss';
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
    displayPropsDossierFacturen,
    breadcrumbs,
    title,
    routeConfig,
  } = useDossierDetailData();
  useHTMLDocumentTitle(routeConfig.detailPage.documentTitle);

  return (
    <ThemaDetailPagina
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

              <PageContentCell className={styles.Section}>
                <CollapsiblePanel title="Facturen">
                  <DataTableFacturen
                    dossier={dossier}
                    relatieCode={relatieCode}
                    isLoading={isLoading || isLoadingThemaData}
                    displayProps={displayPropsDossierFacturen}
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
