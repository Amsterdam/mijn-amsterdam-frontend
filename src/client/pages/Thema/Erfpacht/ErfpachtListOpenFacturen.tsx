import { useErfpachtThemaData } from './useErfpachtThemaData.hook';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

export function ErfpachtListOpenFacturen() {
  const {
    tableConfig,
    isLoading,
    isError,
    openFacturen,
    listPageParamKind,
    breadcrumbs,
    routeConfig,
  } = useErfpachtThemaData();
  useHTMLDocumentTitle(routeConfig.listPageOpenFacturen.documentTitle);

  const tableConfigFacturen = tableConfig?.[listPageParamKind.openFacturen];
  const displayProps = tableConfigFacturen?.displayProps ?? {};

  return (
    <ListPagePaginated
      items={openFacturen}
      title={tableConfigFacturen?.title ?? 'Openstaande facturen'}
      appRoute={tableConfigFacturen?.listPageRoute ?? ''}
      breadcrumbs={breadcrumbs}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
