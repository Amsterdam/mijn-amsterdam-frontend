import { useDossierDetailData } from './DossierDetail/useErfpachtDossierDetailData.hook.ts';
import { Datalist } from '../../../components/Datalist/Datalist.tsx';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated.tsx';
import { MaRouterLink } from '../../../components/MaLink/MaLink.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function ErfpachtDossierZakenList() {
  const {
    zaken,
    isError,
    isLoading,
    breadcrumbs,
    themaId,
    themaConfig,
    tableConfigZaken,
    dossier,
  } = useDossierDetailData();

  useHTMLDocumentTitle(themaConfig.listPageDossierZaken.route);

  const displayPropsZaken = tableConfigZaken?.displayProps ?? {};

  return (
    <ListPagePaginated
      items={zaken}
      themaId={themaId}
      pageContentTop={
        <PageContentCell>
          <Datalist
            rows={[
              {
                label: 'Dossiernummer',
                content: (
                  <MaRouterLink href={dossier?.link.to ?? ''}>
                    {dossier?.dossierNummer}
                  </MaRouterLink>
                ),
              },
              {
                label: 'Adres erfpachtdossier',
                content: dossier?.voorkeursadres ?? 'Onbekend',
              },
            ]}
          />
        </PageContentCell>
      }
      title={tableConfigZaken?.title ?? 'Lopende zaken'}
      appRoute={tableConfigZaken?.listPageRoute ?? ''}
      breadcrumbs={breadcrumbs}
      displayProps={displayPropsZaken}
      isLoading={isLoading}
      isError={isError}
      pageSize={2}
    />
  );
}
