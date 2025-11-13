import { useState, type ReactNode } from 'react';

import { ActionGroup, Button, Paragraph } from '@amsterdam/design-system-react';

import { EMANDATE_STATUS_ACTIVE } from './Afis-thema-config';
import type {
  AfisEMandateFrontend,
  AfisEMandateSignRequestResponse,
  AfisEMandateStatusChangeResponse,
} from '../../../../server/services/afis/afis-types';
import { Modal } from '../../../components/Modal/Modal';
import { Spinner } from '../../../components/Spinner/Spinner';
import type { BFFApiHook } from '../../../hooks/api/useBffApi';

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

type ApiActionButtonProps<T> = {
  api: BFFApiHook<T>;
  fetch: () => void;
  label: string;
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
    <>
      <Button
        variant="secondary"
        disabled={api.isLoading}
        onClick={
          doConfirm ? () => setIsConfirmationModalActive(true) : () => fetch()
        }
      >
        {api.isLoading && <Spinner />}
        {label}
      </Button>
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
    </>
  );
}

type AfisEMandateActionUrlProps = {
  eMandate: AfisEMandateFrontend;
  redirectUrlApi: BFFApiHook<AfisEMandateSignRequestResponse>;
  statusChangeApi: BFFApiHook<AfisEMandateStatusChangeResponse>;
};

export function AfisEMandateActionUrls({
  eMandate,
  redirectUrlApi,
  statusChangeApi,
}: AfisEMandateActionUrlProps) {
  return (
    <>
      {eMandate.signRequestUrl && (
        <ApiActionButton
          api={redirectUrlApi}
          fetch={() => redirectUrlApi.fetch()}
          label={
            eMandate.status === EMANDATE_STATUS_ACTIVE
              ? 'Wijzigen'
              : 'Activeren'
          }
          doConfirm={false}
        />
      )}
      &nbsp;
      {eMandate.statusChangeUrl &&
        eMandate.status === EMANDATE_STATUS_ACTIVE && (
          <ApiActionButton
            api={statusChangeApi}
            fetch={() => statusChangeApi.fetch()}
            label="Stopzetten"
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
