import { useState, type ReactElement } from 'react';

import {
  ActionGroup,
  Alert,
  Button,
  Paragraph,
  Table,
} from '@amsterdam/design-system-react';

import { EMANDATE_STATUS_ACTIVE } from './Afis-thema-config.ts';
import styles from './AfisEmandateActionButtons.module.scss';
import { useAfisFacturenData } from './useAfisThemaData.hook.tsx';
import type {
  AfisEMandateFrontend,
  AfisEMandateSignRequestResponse,
  AfisEMandateStatusChangeResponse,
} from '../../../../server/services/afis/afis-types.ts';
import { Modal } from '../../../components/Modal/Modal.tsx';
import { Spinner } from '../../../components/Spinner/Spinner.tsx';
import type { BFFApiHook } from '../../../hooks/api/useBffApi.ts';

type ActionConfirmationModalProps = {
  confirmationText: ReactElement | string;
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
      className={styles.ActionConfirmationModal}
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

type AfisEMandateActionButtonsProps = {
  eMandate: AfisEMandateFrontend;
  redirectUrlApi: BFFApiHook<AfisEMandateSignRequestResponse | null> & {
    requestRedirectUrl: (isActive: boolean) => void;
  };
  deactivateApi: BFFApiHook<AfisEMandateStatusChangeResponse | null>;
};

export function AfisEMandateActionButtons({
  eMandate,
  redirectUrlApi,
  deactivateApi,
}: AfisEMandateActionButtonsProps) {
  const isActive = eMandate.status === EMANDATE_STATUS_ACTIVE;
  return (
    <>
      {eMandate.signRequestUrl && (
        <ApiActionButton
          api={redirectUrlApi}
          fetch={() => redirectUrlApi.requestRedirectUrl(isActive)}
          label={isActive ? 'Rekening wijzigen' : 'Activeren'}
          doConfirm={false}
        />
      )}
      &nbsp;
      {eMandate.deactivateUrl && eMandate.status === EMANDATE_STATUS_ACTIVE && (
        <ApiDeactivateButton
          deactivateApi={deactivateApi}
          eMandate={eMandate}
        />
      )}
    </>
  );
}

function ApiDeactivateButton({
  deactivateApi,
  eMandate,
}: {
  deactivateApi: BFFApiHook<AfisEMandateStatusChangeResponse | null>;
  eMandate: AfisEMandateFrontend;
}) {
  const { facturenByState } = useAfisFacturenData();
  const facturenByEmandateId = facturenByState?.open
    ? facturenByState.open.facturen.filter(
        (factuur) => factuur.eMandateId === eMandate.eMandateIdSource
      )
    : [];
  return (
    <ApiActionButton
      api={deactivateApi}
      fetch={() => deactivateApi.fetch()}
      label="Stopzetten"
      doConfirm
      confirmationModal={{
        title: 'Stopzetten E-Mandaat',
        confirmationText: (
          <>
            {!!facturenByEmandateId.length && (
              <Alert
                headingLevel={4}
                severity="warning"
                heading="Let op"
                className="ams-mb-m"
              >
                <Paragraph className="ams-mb-s">
                  Facturen die gekoppeld zijn aan dit E-Mandaat worden niet meer
                  per automatische incasso voldaan.
                  <br />
                </Paragraph>
                <Table className={styles.FacturenAlertTable}>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Factuurnummer</Table.HeaderCell>
                      <Table.HeaderCell>Bedrag</Table.HeaderCell>
                      <Table.HeaderCell>Vervaldatum</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  {facturenByEmandateId.map((factuur) => {
                    return (
                      <Table.Row key={factuur.id}>
                        <Table.Cell>{factuur.factuurNummerEl}</Table.Cell>
                        <Table.Cell>
                          {factuur.amountOriginalFormatted}
                        </Table.Cell>
                        <Table.Cell>
                          {factuur.paymentDueDateFormatted}
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table>
              </Alert>
            )}
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
  );
}
