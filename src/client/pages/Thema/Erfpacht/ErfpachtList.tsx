import { listPageParamKind } from './Erfpacht-thema-config';
import { useErfpachtThemaData } from './useErfpachtThemaData.hook';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

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
