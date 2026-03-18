import { listPageParamKind } from './Erfpacht-thema-config.ts';
import { useErfpachtThemaData } from './useErfpachtThemaData.hook.ts';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function ErfpachtList() {
  const {
    themaId,
    isLoading,
    isError,
    dossiers,
    tableConfig,
    breadcrumbs,
    themaConfig,
  } = useErfpachtThemaData();
  useHTMLDocumentTitle(themaConfig.listPage.route);

  const tableConfigDossiers = tableConfig?.[listPageParamKind.erfpachtDossiers];
  const displayPropsDossiers = tableConfigDossiers?.displayProps ?? {};

  return (
    <ListPagePaginated
      items={dossiers}
      themaId={themaId}
      title={tableConfigDossiers?.title ?? 'Erfpachtrechten'}
      appRoute={tableConfigDossiers?.listPageRoute ?? ''}
      breadcrumbs={breadcrumbs}
      displayProps={displayPropsDossiers}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
