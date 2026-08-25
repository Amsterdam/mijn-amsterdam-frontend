import { generatePath } from 'react-router';

import { DataTableBijzondereBepalingen } from './DossierDetail/DatalistBijzondereBepalingen.tsx';
import { DatalistGeneral } from './DossierDetail/DatalistGeneral.tsx';
import { DatalistJuridisch } from './DossierDetail/DatalistJuridisch.tsx';
import { DatalistsFinancieel } from './DossierDetail/DatalistsFinancieel.tsx';
import { useDossierDetailData } from './DossierDetail/useErfpachtDossierData.hook.ts';
import { CollapsiblePanel } from '../../../../../components/CollapsiblePanel/CollapsiblePanel.tsx';
import { PageContentCell } from '../../../../../components/Page/Page.tsx';
import { ThemaDetailPagina } from '../../../../../components/Thema/ThemaDetailPagina.tsx';
import { ThemaPaginaDataView } from '../../../../../components/Thema/ThemaPaginaDataView.tsx';
import { useHTMLDocumentTitle } from '../../../../../hooks/useHTMLDocumentTitle.ts';
import { useAfisThemaData } from '../Afis/useAfisThemaData.hook.tsx';

export function ErfpachtDossierDetail() {
  const {
    dossier,
    zaken,
    isError,
    isLoading,
    isErrorThemaData,
    isLoadingThemaData,
    relatieCode,
    breadcrumbs,
    themaId,
    title,
    themaConfig,
    tableConfigZaken,
  } = useDossierDetailData();
  useHTMLDocumentTitle(themaConfig.detailPageDossier.route);

  const afis = useAfisThemaData();
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

              <PageContentCell>
                <CollapsiblePanel title="Wijzigingsaanvragen">
                  <ThemaPaginaDataView
                    zaken={zaken}
                    textNoContent="U heeft (nog) geen wijzigingsaanvragen."
                    listPageRoute={generatePath(
                      themaConfig.listPageDossierZaken.route.path,
                      { dossierId: dossier.dossierId }
                    )}
                    displayProps={tableConfigZaken.displayProps}
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
