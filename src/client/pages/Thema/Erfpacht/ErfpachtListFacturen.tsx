import { Heading } from '@amsterdam/design-system-react';
import { generatePath, useParams } from 'react-router';

import { useErfpachtThemaData } from './useErfpachtThemaData.hook';
import type { ErfpachtDossiersDetail } from '../../../../server/services/erfpacht/erfpacht-types';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { PageContentCell } from '../../../components/Page/Page';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

export function ErfpachtListFacturen() {
  const {
    tableConfig,
    id: themaId,
    listPageParamKind,
    breadcrumbs,
    routeConfig,
  } = useErfpachtThemaData();
  useHTMLDocumentTitle(routeConfig.listPageAlleFacturen);

  const { dossierNummerUrlParam = null } = useParams<{
    dossierNummerUrlParam: string;
  }>();

  const dossier: ErfpachtDossiersDetail | null = null;
  const tableConfigFacturen = tableConfig?.[listPageParamKind.alleFacturen];
  const displayProps = tableConfigFacturen?.displayProps ?? {};

  return (
    <ListPagePaginated
      pageContentTop={
        !!dossier && (
          <PageContentCell spanWide={8}>
            <Heading level={3} size="level-2">
              {/* {dossier.voorkeursadres} */}
            </Heading>
          </PageContentCell>
        )
      }
      // items={dossier?.facturen?.facturen ?? []}
      items={[]}
      themaId={themaId}
      title={tableConfigFacturen?.title ?? 'Facturen'}
      appRoute={generatePath(tableConfigFacturen?.listPageRoute ?? '', {
        dossierNummerUrlParam,
        page: null,
      })}
      breadcrumbs={breadcrumbs}
      displayProps={displayProps}
      isLoading={false}
      isError={false}
    />
  );
}
