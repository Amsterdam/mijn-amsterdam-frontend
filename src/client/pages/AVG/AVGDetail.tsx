import { generatePath } from 'react-router-dom';

import { AVGRequestFrontend } from '../../../server/services/avg/types';
import { AppRoutes } from '../../../universal/config/routes';
import { ThemaIcon } from '../../components';
import { Datalist } from '../../components/Datalist/Datalist';
import { ThemaTitles } from '../../config/thema';
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

  return <Datalist rows={rows} />;
}

function AVGDetail() {
  const { verzoek, isLoading, isError } = useAVGDetailPage();
  return (
    <ThemaDetailPagina<AVGRequestFrontend>
      title="AVG verzoek"
      zaak={verzoek}
      isError={isError}
      isLoading={isLoading}
      icon={<ThemaIcon />}
      pageContentTop={!!verzoek && <AVGDetailContent verzoek={verzoek} />}
      backLink={{
        to: generatePath(AppRoutes.AVG, {
          page: 1,
        }),
        title: ThemaTitles.AVG,
      }}
    />
  );
}

export default AVGDetail;
