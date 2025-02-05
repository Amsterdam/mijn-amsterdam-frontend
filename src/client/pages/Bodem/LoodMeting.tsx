import { generatePath } from 'react-router-dom';

import { useBodemDetailData } from './useBodemDetailData.hook';
import { LoodMetingFrontend } from '../../../server/services/bodem/types';
import { AppRoutes } from '../../../universal/config/routes';
import { Datalist } from '../../components/Datalist/Datalist';
import { DocumentLink } from '../../components/DocumentList/DocumentLink';
import { AddressDisplayAndModal } from '../../components/LocationModal/LocationModal';
import { PageContentCell } from '../../components/Page/Page';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';

export function LoodMeting() {
  const { meting, isLoading, isError } = useBodemDetailData();

  const BodemDetailRows = (meting: LoodMetingFrontend) => {
    return [
      { label: 'Kenmerk', content: meting.kenmerk },
      {
        label: 'Locatie',
        content: !!meting.adres && (
          <AddressDisplayAndModal address={meting.adres} />
        ),
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
      <PageContentCell>
        <Datalist rows={BodemDetailRows(meting)} />
      </PageContentCell>
    );
  }

  return (
    <ThemaDetailPagina
      title="Lood in bodem-check"
      zaak={meting}
      backLink={generatePath(AppRoutes.BODEM)}
      isError={isError}
      isLoading={isLoading}
      pageContentTop={!!meting && <BodemDetailContent meting={meting} />}
    />
  );
}
