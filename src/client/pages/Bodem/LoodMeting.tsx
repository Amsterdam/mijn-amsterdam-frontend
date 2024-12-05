import { Grid } from '@amsterdam/design-system-react';
import { generatePath } from 'react-router-dom';

import { useBodemDetailData } from './useBodemDetailData.hook';
import { LoodMetingFrontend } from '../../../server/services/bodem/types';
import { AppRoutes } from '../../../universal/config/routes';
import { Datalist } from '../../components/Datalist/Datalist';
import { DocumentLink } from '../../components/DocumentList/DocumentLink';
import { LocationModal } from '../../components/LocationModal/LocationModal';
import ThemaIcon from '../../components/ThemaIcon/ThemaIcon';
import { ThemaTitles } from '../../config/thema';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';

export function LoodMeting() {
  const { meting, isLoading, isError } = useBodemDetailData();

  const BodemDetailRows = (meting: LoodMetingFrontend) => {
    return [
      { label: 'Kenmerk', content: meting.kenmerk },
      {
        label: 'Locatie',
        content: !!meting.adres && <LocationModal address={meting.adres} />,
      },
      {
        label: 'Document',
        content: !!meting.document && (
          <DocumentLink document={meting.document} />
        ),
      },
    ].filter((row) => !!row.content);
  };

  function BodemDetailContent({ meting }: { meting: LoodMetingFrontend }) {
    return (
      <Grid.Cell span="all">
        <Datalist rows={BodemDetailRows(meting)} />
      </Grid.Cell>
    );
  }

  return (
    <ThemaDetailPagina
      title="Lood in bodem-check"
      icon={<ThemaIcon />}
      zaak={meting}
      backLink={{
        to: generatePath(AppRoutes.BODEM),
        title: ThemaTitles.BODEM,
      }}
      isError={isError}
      isLoading={isLoading}
      pageContentTop={!!meting && <BodemDetailContent meting={meting} />}
    />
  );
}
