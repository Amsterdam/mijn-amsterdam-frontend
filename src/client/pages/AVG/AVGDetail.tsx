import { AVGRequestFrontend } from '../../../server/services/avg/types';
import { Datalist } from '../../components/Datalist/Datalist';
import { PageContentCell } from '../../components/Page/Page';
import { useAVGDetailPage } from '../AVG/useAVGDetailPage.hook';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';

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

function AVGDetail() {
  const { verzoek, isLoading, isError, backLink } = useAVGDetailPage();
  return (
    <ThemaDetailPagina<AVGRequestFrontend>
      title="AVG verzoek"
      zaak={verzoek}
      isError={isError}
      isLoading={isLoading}
      pageContentTop={!!verzoek && <AVGDetailContent verzoek={verzoek} />}
      backLink={backLink}
    />
  );
}

export { AVGDetail };
