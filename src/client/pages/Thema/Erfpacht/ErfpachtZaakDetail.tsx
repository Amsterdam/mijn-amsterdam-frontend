import { useZaakDetailData } from './useErfpachtZaakData.hook.ts';
import { Datalist, type Row } from '../../../components/Datalist/Datalist.tsx';
import { ThemaDetailPagina } from '../../../components/Thema/ThemaDetailPagina.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function ErfpachtZaakDetail() {
  const {
    zaak,
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
    { label: 'Zaaknummer', content: zaak?.zaakNummer ?? '-' },
    {
      label: 'Dossiers',
      content: zaak?.dossierLinks ?? [],
    },
    {
      label: 'Resultaat',
      content: zaak?.resultaat,
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
