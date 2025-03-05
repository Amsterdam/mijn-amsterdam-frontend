import { useParams } from 'react-router-dom';

import { routes } from './Klachten-thema-config';
import { useKlachtenThemaData } from './useKlachtenThemaData.hook';
import { Klacht } from '../../../server/services/klachten/types';
import { defaultDateFormat } from '../../../universal/helpers/date';
import InfoDetail from '../../components/InfoDetail/InfoDetail';
import { PageContentCell } from '../../components/Page/Page';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';

export function KlachtenDetailPagina() {
  const { klachten, isLoading, isError } = useKlachtenThemaData();
  const { id } = useParams<{ id: string }>();
  const klacht = klachten.find((klacht) => klacht.id === id);

  return (
    <ThemaDetailPagina<Klacht>
      title={klacht?.onderwerp || 'Klacht'}
      zaak={klacht}
      isError={isError}
      isLoading={isLoading}
      pageContentMain={
        klacht && (
          <PageContentCell>
            <InfoDetail
              label="Nummer van uw klacht"
              value={klacht?.id || '-'}
            />
            <InfoDetail
              label="Ontvangen op"
              value={
                klacht?.ontvangstDatum
                  ? defaultDateFormat(klacht?.ontvangstDatum)
                  : '-'
              }
            />
            <InfoDetail
              label="Wat is de klacht?"
              value={klacht?.omschrijving}
            />
            {klacht?.locatie && (
              <InfoDetail
                label="Wat is de locatie waar de klacht is ontstaan?"
                value={klacht?.locatie}
              />
            )}
            {klacht?.gewensteOplossing && (
              <InfoDetail
                label="Wat wilt u dat de gemeente gaat doen naar aanleiding van uw klacht?"
                value={klacht?.gewensteOplossing}
              />
            )}
          </PageContentCell>
        )
      }
      backLink={routes.themaPage}
    />
  );
}
