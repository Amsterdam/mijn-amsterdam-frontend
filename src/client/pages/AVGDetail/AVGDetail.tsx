import { generatePath } from 'react-router-dom';

import { AVGRequestFrontend } from '../../../server/services/avg/types';
import { AppRoutes } from '../../../universal/config/routes';
import { ThemaIcon } from '../../components';
import { Datalist } from '../../components/Datalist/Datalist';
import { ThemaTitles } from '../../config/thema';
import { useAVGDetailPage } from '../AVG/useAVGDetailPage.hook';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';

function AVGDetailContent({ verzoek }: { verzoek: AVGRequestFrontend }) {
  const rows = [];

  if (verzoek?.id) {
    rows.push({ content: verzoek.id, label: 'Nummer' });
  }
  if (verzoek?.type) {
    rows.push({ content: verzoek.type, label: 'Type verzoek' });
  }
  if (verzoek?.themas) {
    rows.push({ content: verzoek.themas.join(', '), label: 'Onderwerp(en)' });
  }

  return <Datalist rows={rows} />;
}

const AVGDetail = () => {
  const { verzoek, isLoading, isError } = useAVGDetailPage();
  console.log(verzoek, 'verzoek');
  return (
    <ThemaDetailPagina<AVGRequestFrontend>
      title={'AVG verzoek'}
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
};

export default AVGDetail;
