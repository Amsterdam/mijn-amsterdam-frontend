import { Grid } from '@amsterdam/design-system-react';
import { useParams } from 'react-router-dom';

import { useJeugdThemaData } from './useJeugdThemaData';
import { LeerlingenvervoerVoorzieningFrontend } from '../../../server/services/jeugd/jeugd';
import { AppRoutes } from '../../../universal/config/routes';
import { ThemaIcon } from '../../components';
import { Datalist } from '../../components/Datalist/Datalist';
import DocumentListV2 from '../../components/DocumentList/DocumentListV2';
import { ThemaTitles } from '../../config/thema';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';

type ContentProps = {
  voorziening: LeerlingenvervoerVoorzieningFrontend;
};

function JeugdDetailContent({ voorziening }: ContentProps) {
  const rows = [];
  if (voorziening.decision) {
    rows.push({ content: voorziening?.decision, label: 'Resultaat' });
  }
  return (
    <>
      {!!rows.length && (
        <Grid.Cell span="all">
          <Datalist rows={rows} />
          {voorziening?.documents.length > 0 && (
            <DocumentListV2
              documents={voorziening.documents}
              columns={['Brieven', 'Verzenddatum']}
              className="ams-mb--lg"
            />
          )}
        </Grid.Cell>
      )}
    </>
  );
}

export function JeugdDetail() {
  const { voorzieningen, isError, isLoading } = useJeugdThemaData();
  const { id } = useParams<{
    id: LeerlingenvervoerVoorzieningFrontend['id'];
  }>();
  const voorziening = voorzieningen.find((item) => item.id === id);

  return (
    <ThemaDetailPagina<LeerlingenvervoerVoorzieningFrontend>
      title={voorziening?.title ?? 'Voorziening'}
      zaak={voorziening}
      isError={isError}
      isLoading={isLoading}
      icon={<ThemaIcon />}
      pageContentTop={
        !!voorziening && <JeugdDetailContent voorziening={voorziening} />
      }
      backLink={{
        title: ThemaTitles.JEUGD,
        to: AppRoutes.JEUGD,
      }}
    />
  );
}
