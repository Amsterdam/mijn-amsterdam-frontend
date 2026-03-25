import { useAVGDetailPage } from './useAVGDetailPage.hook.tsx';
import type { AVGRequestFrontend } from '../../../../server/services/avg/types.ts';
import { Datalist } from '../../../components/Datalist/Datalist.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

function getVerzoekRows(verzoek: AVGRequestFrontend) {
  return [
    { label: 'Nummer', content: verzoek.id },
    { label: 'Type verzoek', content: verzoek.type },
    { label: 'Onderwerp(en)', content: verzoek.themas },
    { label: 'Toelichting', content: verzoek.toelichting },
  ].filter((row) => row.content);
}

function AVGDetailContent({ verzoek }: { verzoek: AVGRequestFrontend }) {
  const rows = getVerzoekRows(verzoek);

  return (
    <PageContentCell>
      <Datalist rows={rows} />
    </PageContentCell>
  );
}

export function AVGDetail() {
  const { verzoek, isLoading, isError, breadcrumbs, title, themaConfig } =
    useAVGDetailPage();
  useHTMLDocumentTitle(themaConfig.detailPage.route);
  return (
    <ThemaDetailPagina
      themaId={themaConfig.id}
      title={title}
      zaak={verzoek}
      isError={isError}
      isLoading={isLoading}
      pageContentMain={!!verzoek && <AVGDetailContent verzoek={verzoek} />}
      breadcrumbs={breadcrumbs}
    />
  );
}
