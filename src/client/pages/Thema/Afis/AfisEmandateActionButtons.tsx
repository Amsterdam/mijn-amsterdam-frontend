import React from 'react';

import { Button, Icon } from '@amsterdam/design-system-react';
import { AlertIcon } from '@amsterdam/design-system-react-icons';

import styles from './AfisEmandateActionButtons.module.scss';
import { useAfisEMandatesData } from './useAfisThemaData.hook';
import type {
  AfisEMandateFrontend,
  AfisEMandateSignRequestResponse,
  AfisEMandateStatusChangeResponse,
} from '../../../../server/services/afis/afis-types';
import type { ApiResponse } from '../../../../universal/helpers/api';
import { Spinner } from '../../../components/Spinner/Spinner';
import {
  type ApiStateV2,
  fetchDefault,
  useDataApiV2,
} from '../../../hooks/api/useDataApi';

type AfisEMandateActionUrlProps = {
  eMandate: AfisEMandateFrontend;
};

type ApiActionButtonProps<T> = {
  api: ApiStateV2<ApiResponse<T>>;
  fetch: () => void;
  label: React.ReactNode;
  errorMessage: React.ReactNode;
};

function ApiActionButton<T>({
  api,
  fetch,
  label,
  errorMessage,
}: ApiActionButtonProps<T>) {
  return (
    <span className={api.isError ? styles.Error : ''}>
      <Button variant="secondary" onClick={() => fetch()}>
        {api.isLoading && <Spinner />}
        {!api.isLoading && api.isError && (
          <Icon className={styles.Icon} svg={AlertIcon} size="heading-5" />
        )}
        {label}
      </Button>
      {api.isLoading && <span className={styles.Info}>Bezig...</span>}
      {api.isError && <span className={styles.Info}>{errorMessage}</span>}
    </span>
  );
}

export function AfisEMandateActionUrls({
  eMandate,
}: AfisEMandateActionUrlProps) {
  const { refetchEMandates } = useAfisEMandatesData();

  const redirectUrlApi = useDataApiV2<
    ApiResponse<AfisEMandateSignRequestResponse>
  >(eMandate.signRequestUrl, {
    postpone: true,
    fetcher: (url) => {
      return fetchDefault(url).then((response) => {
        window.location.href = response.content.redirectUrl;
        return response;
      });
    },
  });

  const statusChangeApi = useDataApiV2<
    ApiResponse<AfisEMandateStatusChangeResponse>
  >(eMandate.statusChangeUrl, {
    postpone: true,
    fetcher: (url) => {
      return fetchDefault(url).then((response) => {
        refetchEMandates();
        return response;
      });
    },
  });

  return (
    <>
      {eMandate.signRequestUrl && (
        <ApiActionButton
          api={redirectUrlApi}
          fetch={() => redirectUrlApi.fetch()}
          label={eMandate.status === '1' ? 'Wijzigen' : 'Activeren'}
          errorMessage="Er is iets misgegaan bij het ophalen van de link naar het volgende scherm"
        />
      )}
      &nbsp;
      {eMandate.statusChangeUrl && eMandate.status === '1' && (
        <ApiActionButton
          api={statusChangeApi}
          fetch={() => statusChangeApi.fetch()}
          label="Stopzetten"
          errorMessage="Er is iets misgegaan bij het veranderen van de status"
        />
      )}
    </>
  );
}
