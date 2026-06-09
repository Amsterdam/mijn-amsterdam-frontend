import { UnorderedList } from '@amsterdam/design-system-react';

import { useZaakDetailData } from './useErfpachtZaakData.hook.ts';
import { Datalist, type Row } from '../../../components/Datalist/Datalist.tsx';
import { ThemaDetailPagina } from '../../../components/Thema/ThemaDetailPagina.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function ErfpachtZaakDetail() {
  const {
    zaak,
    dossierLinks,
    isLoading,
    isError,
    isLoadingThemaData,
    isErrorThemaData,
    themaId,
    title,
    breadcrumbs,
    themaConfig,
  } = useZaakDetailData();

  useHTMLDocumentTitle(themaConfig.detailPageZaak.route);

  const rows: Row[] = [
    { label: 'Zaaknummer', content: zaak?.identificatie ?? '-' },
    {
      label: 'Dossiers',
      content: (
        <UnorderedList>
          {dossierLinks.map((linkEl, index) => (
            <UnorderedList.Item key={index}>{linkEl}</UnorderedList.Item>
          ))}
        </UnorderedList>
      ),
    },
    {
      label: 'Resultaat',
      content: 'Resultaat van de zaak',
      isVisible: !!zaak?.resultaat,
    },
  ];

  return (
    <ThemaDetailPagina
      themaId={themaId}
      title={title}
      zaak={zaak}
      isError={isError || isErrorThemaData}
      isLoading={isLoading || isLoadingThemaData}
      pageContentMain={!!zaak && <Datalist rows={rows} />}
      breadcrumbs={breadcrumbs}
    />
  );
}
