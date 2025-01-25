import { useParams } from 'react-router-dom';

import type { Klacht } from '../../../server/services/klachten/types';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { ErrorAlert, InfoDetail } from '../../components';
import {
  DetailPageV2,
  PageContentCell,
  PageContentV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';
import { useAppStateGetter } from '../../hooks/useAppState';

export function KlachtenDetailPagina() {
  const { KLACHTEN } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();
  const klachtIndex = (KLACHTEN.content?.klachten || []).findIndex(
    (klacht: Klacht) => klacht.id === id
  );

  const klacht = KLACHTEN.content?.klachten[klachtIndex];

  const noContent = !isLoading(KLACHTEN) && !klacht;

  return (
    <DetailPageV2>
      <PageContentV2>
        <PageHeadingV2 backLink={AppRoutes.KLACHTEN}>
          {klacht?.onderwerp || 'Klacht'}
        </PageHeadingV2>
        <PageContentCell>
          {isError(KLACHTEN) || noContent ? (
            <ErrorAlert>
              We kunnen op dit moment geen gegevens tonen.
            </ErrorAlert>
          ) : (
            <>
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
            </>
          )}
        </PageContentCell>
      </PageContentV2>
    </DetailPageV2>
  );
}
