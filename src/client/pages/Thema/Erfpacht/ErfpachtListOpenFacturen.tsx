import { useErfpachtThemaData } from './useErfpachtThemaData.hook';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

export function ErfpachtListOpenFacturen() {
  const {
    id: themaId,
    tableConfig,
    isLoading,
    isError,
    openFacturen,
    listPageParamKind,
    breadcrumbs,
    routeConfig,
  } = useErfpachtThemaData();
  useHTMLDocumentTitle(routeConfig.listPageOpenFacturen);

  const tableConfigFacturen = tableConfig?.[listPageParamKind.openFacturen];
  const displayProps = tableConfigFacturen?.displayProps ?? {};

  return (
    <ListPagePaginated
      items={openFacturen}
      themaId={themaId}
      title={tableConfigFacturen?.title ?? 'Openstaande facturen'}
      appRoute={tableConfigFacturen?.listPageRoute ?? ''}
      breadcrumbs={breadcrumbs}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
