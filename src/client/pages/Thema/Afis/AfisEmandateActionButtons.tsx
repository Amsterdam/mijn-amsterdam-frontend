import React, { useState, type ReactNode } from 'react';

import {
  ActionGroup,
  Button,
  Icon,
  Paragraph,
} from '@amsterdam/design-system-react';
import { AlertIcon } from '@amsterdam/design-system-react-icons';

import styles from './AfisEmandateActionButtons.module.scss';
import {
  optimisticEmandatesUpdate,
  useAfisEMandatesData,
} from './useAfisThemaData.hook';
import type {
  AfisEMandateFrontend,
  AfisEMandateSignRequestResponse,
  AfisEMandateStatusChangeResponse,
} from '../../../../server/services/afis/afis-types';
import { Modal } from '../../../components/Modal/Modal';
import { Spinner } from '../../../components/Spinner/Spinner';
import {
  type ApiStateV2,
  sendGetRequest,
  useDataApiV2,
} from '../../../hooks/api/useDataApi';

type ActionConfirmationModalProps = {
  confirmationText: ReactNode;
  confirmLabel: string;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
};

function ActionConfirmationModal({
  confirmationText,
  confirmLabel,
  onClose,
  onConfirm,
  title,
}: ActionConfirmationModalProps) {
  const confirmationTextNode =
    typeof confirmationText === 'string' ? (
      <Paragraph className="ams-mb-s">{confirmationText}</Paragraph>
    ) : (
      confirmationText
    );
  return (
    <Modal
      title={title}
      isOpen
      showCloseButton
      closeOnEscape
      onClose={onClose}
      pollingQuerySelector="#action-confirmation"
      actions={
        <ActionGroup>
          <Button
            id="action-confirmation"
            onClick={onConfirm}
            variant="primary"
          >
            {confirmLabel}
          </Button>
          <Button variant="tertiary" onClick={onClose}>
            Terug
          </Button>
        </ActionGroup>
      }
    >
      {confirmationTextNode}
    </Modal>
  );
}

type AfisEMandateActionUrlProps = {
  eMandate: AfisEMandateFrontend;
};

type ApiActionButtonProps<T> = {
  api: ApiStateV2<T>;
  fetch: () => void;
  label: string;
  errorMessage: ReactNode;
  doConfirm: boolean;
  confirmationModal?: Pick<
    ActionConfirmationModalProps,
    'confirmationText' | 'confirmLabel' | 'title'
  >;
};

function ApiActionButton<T>({
  api,
  fetch,
  label,
  errorMessage,
  doConfirm = false,
  confirmationModal = {
    confirmationText: 'Weet je zeker dat je deze actie wilt uitvoeren?',
    confirmLabel: `Ja`,
    title: 'Bevestig actie',
  },
}: ApiActionButtonProps<T>) {
  const [isConfirmationModalActive, setIsConfirmationModalActive] =
    useState(false);
  return (
    <span className={api.isError ? styles.Error : ''}>
      <Button
        variant="secondary"
        disabled={api.isLoading}
        onClick={
          doConfirm ? () => setIsConfirmationModalActive(true) : () => fetch()
        }
      >
        {api.isLoading && <Spinner />}
        {!api.isLoading && api.isError && (
          <Icon className={styles.Icon} svg={AlertIcon} size="heading-5" />
        )}
        {label}
      </Button>
      {api.isError && <span className={styles.Info}>{errorMessage}</span>}
      {isConfirmationModalActive && (
        <ActionConfirmationModal
          confirmationText={confirmationModal.confirmationText}
          confirmLabel={confirmationModal.confirmLabel}
          title={confirmationModal.title}
          onConfirm={() => {
            setIsConfirmationModalActive(false);
            fetch();
          }}
          onClose={() => {
            setIsConfirmationModalActive(false);
          }}
        />
      )}
    </span>
  );
}

export function AfisEMandateActionUrls({
  eMandate,
}: AfisEMandateActionUrlProps) {
  const { mutate } = useAfisEMandatesData();

  const redirectUrlApi = useDataApiV2<AfisEMandateSignRequestResponse>(
    eMandate.signRequestUrl,
    {
      postpone: true,
      fetcher: (url: string) => {
        return sendGetRequest<AfisEMandateSignRequestResponse>(url).then(
          (content) => {
            window.location.href = content.redirectUrl;
            return content;
          }
        );
      },
    }
  );

  const statusChangeApi = useDataApiV2<AfisEMandateStatusChangeResponse>(
    eMandate.statusChangeUrl,
    {
      postpone: true,
      fetcher: (url) => {
        return sendGetRequest<AfisEMandateStatusChangeResponse>(url).then(
          (eMandateUpdatePayload) => {
            if (eMandate && eMandateUpdatePayload) {
              mutate(
                optimisticEmandatesUpdate(eMandate, eMandateUpdatePayload),
                {
                  revalidate: false,
                }
              );
            }
            return eMandateUpdatePayload;
          }
        );
      },
    }
  );

  return (
    <>
      {eMandate.signRequestUrl && (
        <ApiActionButton
          api={redirectUrlApi}
          fetch={() => redirectUrlApi.fetch()}
          label={eMandate.status === '1' ? 'Wijzigen' : 'Activeren'}
          errorMessage="Er is iets misgegaan bij het ophalen van de link naar het volgende scherm"
          doConfirm={false}
        />
      )}
      &nbsp;
      {eMandate.statusChangeUrl && eMandate.status === '1' && (
        <ApiActionButton
          api={statusChangeApi}
          fetch={() => statusChangeApi.fetch()}
          label="Stopzetten"
          errorMessage="Er is iets misgegaan bij het veranderen van de status"
          doConfirm
          confirmationModal={{
            title: 'Stopzetten E-Mandaat',
            confirmationText: (
              <>
                <Paragraph className="ams-mb-s">
                  Weet je zeker dat je dit E-mandaat wilt stopzetten?
                </Paragraph>
                <Paragraph className="ams-mb-s">
                  Het E-mandaat wordt dan niet meer gebruikt voor automatische
                  incasso.
                </Paragraph>
                <Paragraph className="ams-mb-s">
                  Je kunt het E-mandaat later opnieuw activeren.
                </Paragraph>
              </>
            ),
            confirmLabel: 'Ja, stopzetten',
          }}
        />
      )}
    </>
  );
}
