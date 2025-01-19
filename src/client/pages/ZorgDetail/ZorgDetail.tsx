import { useParams } from 'react-router-dom';

import { WMOVoorzieningFrontend } from '../../../server/services/wmo/wmo-config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { ErrorAlert } from '../../components';
import { Datalist } from '../../components/Datalist/Datalist';
import DocumentListV2 from '../../components/DocumentList/DocumentListV2';
import { PageContentCell } from '../../components/Page/Page';
import { useAppStateGetter } from '../../hooks/useAppState';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';

type WMODetailContentProps = {
  voorziening: WMOVoorzieningFrontend;
};

function WMODetailContent({ voorziening }: WMODetailContentProps) {
  const rows = [];
  if (voorziening?.decision) {
    rows.push({ content: voorziening?.decision, label: 'Resultaat' });
  }
  if (voorziening?.supplier) {
    rows.push({ content: voorziening?.supplier, label: 'Aanbieder' });
  }

  return (
    <>
      {!!rows.length && (
        <PageContentCell>
          {voorziening?.disclaimer && (
            <ErrorAlert
              className="ams-mb--sm"
              severity="warning"
              title="Let op!"
            >
              {voorziening.disclaimer}
            </ErrorAlert>
          )}
          <Datalist rows={rows} />
          {voorziening?.documents.length > 0 && (
            <DocumentListV2
              documents={voorziening.documents}
              columns={['Brieven', 'Verzenddatum']}
              className="ams-mb--lg"
            />
          )}
        </PageContentCell>
      )}
    </>
  );
}

export default function ZorgDetail() {
  const appState = useAppStateGetter();
  const { WMO } = appState;
  const { id } = useParams<{ id: WMOVoorzieningFrontend['id'] }>();
  const voorziening = WMO.content?.find((item) => item.id === id);

  return (
    <ThemaDetailPagina<WMOVoorzieningFrontend>
      title={voorziening?.title ?? 'Voorziening'}
      zaak={voorziening}
      isError={isError(WMO)}
      isLoading={isLoading(WMO)}
      pageContentTop={
        !!voorziening && <WMODetailContent voorziening={voorziening} />
      }
      backLink={AppRoutes.ZORG}
      documentPathForTracking={(document) =>
        `/downloads/zorg-en-ondersteuning/${document.title.split(/\n/)[0]}`
      }
    />
  );
}
