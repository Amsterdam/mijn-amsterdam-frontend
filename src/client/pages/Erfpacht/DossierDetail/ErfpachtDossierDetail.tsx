import { DataTableBijzondereBepalingen } from './DatalistBijzondereBepalingen';
import { DatalistGeneral } from './DatalistGeneral';
import { DatalistJuridisch } from './DatalistJuridisch';
import { DatalistsFinancieel } from './DatalistsFinancieel';
import { DataTableFacturen } from './DataTableFacturen';
import { useDossierDetaiLData as useDossierDetailData } from './erfpachtDossierData.hook';
import styles from './ErfpachtDossierDetail.module.scss';
import type { ErfpachtV2DossiersDetail } from '../../../../server/services/simple-connect/erfpacht';
import { CollapsiblePanel } from '../../../components/CollapsiblePanel/CollapsiblePanel';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../ThemaPagina/ThemaDetailPagina';

export function ErfpachtDossierDetail() {
  const {
    dossier,
    isError,
    isLoading,
    isErrorThemaData,
    isLoadingThemaData,
    relatieCode,
    displayPropsDossierFacturen,
    themaPaginaBreadcrumb,
  } = useDossierDetailData();

  return (
    <ThemaDetailPagina<ErfpachtV2DossiersDetail>
      title={dossier?.title}
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
      breadcrumbs={[themaPaginaBreadcrumb]}
    />
  );
}
