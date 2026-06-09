import { listPageParamKind } from './Erfpacht-thema-config.ts';
import { useErfpachtThemaData } from './useErfpachtThemaData.hook.tsx';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function ErfpachtZakenList() {
  const {
    themaId,
    isLoading,
    isError,
    zaken,
    tableConfig,
    breadcrumbs,
    themaConfig,
  } = useErfpachtThemaData();
  useHTMLDocumentTitle(themaConfig.listPageZaken.route);

  const tableConfigZaken = tableConfig?.[listPageParamKind.erfpachtZaken];
  const displayPropsZaken = tableConfigZaken?.displayProps ?? {};

  return (
    <ListPagePaginated
      items={zaken}
      themaId={themaId}
      title={tableConfigZaken?.title ?? 'Lopende zaken'}
      appRoute={tableConfigZaken?.listPageRoute ?? ''}
      breadcrumbs={breadcrumbs}
      displayProps={displayPropsZaken}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
