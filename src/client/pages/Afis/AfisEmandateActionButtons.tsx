import React, { useEffect } from 'react';

import { Button, Icon } from '@amsterdam/design-system-react';

import styles from './AfisEmandateActionButtons.module.scss';
import {
  AfisEMandateFrontend,
  AfisEMandateSignRequestResponse,
} from '../../../server/services/afis/afis-types';
import { ApiResponse } from '../../../universal/helpers/api';
import { IconAlert } from '../../assets/icons';
import { Spinner } from '../../components/Spinner/Spinner';
import { ApiState, useDataApi } from '../../hooks/api/useDataApi';

type AfisEMandateActionUrlProps = {
  eMandate: AfisEMandateFrontend;
};

type ApiActionProps<T> = {
  api: ApiState<ApiResponse<T> | null>;
  fetch: () => void;
  label: React.ReactNode;
  errorMessage: React.ReactNode;
};

function ApiActionButton<T>({
  api,
  fetch,
  label,
  errorMessage,
}: ApiActionProps<T>) {
  return (
    <span className={api.isError ? styles.Error : ''}>
      <Button variant="tertiary" onClick={() => fetch()}>
        {api.isLoading && <Spinner />}
        {!api.isLoading && api.isError && (
          <Icon className={styles.Icon} svg={IconAlert} size="level-5" />
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
  const [redirectUrlApi, fetchRedirectUrl] =
    useDataApi<ApiResponse<AfisEMandateSignRequestResponse> | null>(
      {
        postpone: true,
      },
      null
    );

  useEffect(() => {
    if (redirectUrlApi.data?.content?.redirectUrl) {
      window.location.href = redirectUrlApi.data.content.redirectUrl;
    }
  }, [redirectUrlApi.data]);

  const [statusChangeApi, fetchStatusChange] =
    useDataApi<ApiResponse<AfisEMandateSignRequestResponse> | null>(
      {
        postpone: true,
      },
      null
    );

  useEffect(() => {
    if (statusChangeApi.data?.status === 'OK') {
      alert('Update eMandate');
    }
  }, [statusChangeApi.data]);

  return (
    <>
      {eMandate.signRequestUrl && (
        <ApiActionButton
          api={redirectUrlApi}
          fetch={() => fetchRedirectUrl({ url: eMandate.signRequestUrl })}
          label={eMandate.status === '1' ? 'Wijzigen' : 'Activeren'}
          errorMessage="Er is iets misgegaan bij het ophalen van de link"
        />
      )}
      {eMandate.statusChangeUrl && (
        <ApiActionButton
          api={statusChangeApi}
          fetch={() => fetchStatusChange({ url: eMandate.statusChangeUrl })}
          label={eMandate.status === '1' ? 'Stopzetten' : 'Activeren'}
          errorMessage="Er is iets misgegaan bij het veranderen van de status"
        />
      )}
    </>
  );
}
