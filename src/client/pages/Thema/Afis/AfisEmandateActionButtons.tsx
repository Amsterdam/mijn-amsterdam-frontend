import { useMemo, useState, type ReactElement } from 'react';

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
import { delay } from '../../../../universal/helpers/utils.ts';
import { Modal } from '../../../components/Modal/Modal.tsx';
import { Spinner } from '../../../components/Spinner/Spinner.tsx';
import { trackLinkClick } from '../../../hooks/analytics.hook.ts';
import type { BFFApiHook } from '../../../hooks/api/useBffApi.ts';
import { useProfileTypeValue } from '../../../hooks/useProfileType.ts';

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
  fetch: (() => void) | (() => Promise<void>);
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
  const [isFetching, setIsFetching] = useState(false);
  const doFetch = async () => {
    setIsFetching(true);
    await fetch();
    setIsFetching(false);
  };
  return (
    <>
      <Button
        variant="secondary"
        disabled={api.isLoading}
        onClick={
          doConfirm ? () => setIsConfirmationModalActive(true) : () => doFetch()
        }
      >
        {(api.isLoading || isFetching) && <Spinner />}
        {label}
      </Button>
      {isConfirmationModalActive && (
        <ActionConfirmationModal
          confirmationText={confirmationModal.confirmationText}
          confirmLabel={confirmationModal.confirmLabel}
          title={confirmationModal.title}
          onConfirm={() => {
            setIsConfirmationModalActive(false);
            doFetch();
          }}
          onClose={() => {
            setIsConfirmationModalActive(false);
          }}
        />
      )}
    </>
  );
}

export type AfisEMandateActionButtonsProps = {
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
  const profileType = useProfileTypeValue();
  const isActive = eMandate.status === EMANDATE_STATUS_ACTIVE;
  const fetchAndRedirect = (() => {
    let isWaiting = false;
    return async () => {
      if (eMandate.signRequestUrl && !isWaiting) {
        isWaiting = true;
        trackLinkClick(
          'AfisEMandateActionButtons',
          eMandate.signRequestUrl,
          isActive ? 'Rekening wijzigen' : 'Activeren',
          profileType
        );
        await delay(300); // Add slight delay to ensure the analytics event is sent before the redirect happens
        isWaiting = false;
      }
      return redirectUrlApi.requestRedirectUrl(isActive);
    };
  })();
  return (
    <>
      {eMandate.signRequestUrl && (
        <ApiActionButton
          api={redirectUrlApi}
          fetch={fetchAndRedirect}
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
  const profileType = useProfileTypeValue();
  const { facturenByState } = useAfisFacturenData();
  const confirmationModalProps = useMemo(() => {
    const openFacturen = facturenByState?.open?.facturen ?? [];
    const facturenByEmandateId = openFacturen.filter(
      (factuur) => factuur.eMandateId === eMandate.eMandateIdSource
    );

    return {
      title: 'Stopzetten incassomachtiging',
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
                U heeft nog openstaande facturen die gekoppeld zijn aan deze
                incassomachtiging. Deze facturen worden niet meer automatisch
                geïncasseerd als u de machtiging stopzet.
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
                <Table.Body>
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
                </Table.Body>
              </Table>
            </Alert>
          )}
          <Paragraph className="ams-mb-s">
            Weet je zeker dat je deze incassomachtiging wilt stopzetten?
          </Paragraph>
          <Paragraph className="ams-mb-s">
            De incassomachtiging wordt dan niet meer gebruikt.
          </Paragraph>
          <Paragraph className="ams-mb-s">
            Je kunt de incassomachtiging later opnieuw activeren voor nieuwe
            facturen.
          </Paragraph>
        </>
      ),
      confirmLabel: 'Ja, stopzetten',
    };
  }, [eMandate.eMandateIdSource, facturenByState?.open?.facturen]);

  return (
    <ApiActionButton
      api={deactivateApi}
      fetch={async () => {
        if (eMandate.deactivateUrl) {
          trackLinkClick(
            'ApiDeactivateButton',
            eMandate.deactivateUrl,
            'Stopzetten',
            profileType
          );
          await delay(300); // Add slight delay to ensure the analytics event is sent before the redirect happens
        }
        return deactivateApi.fetch();
      }}
      label="Stopzetten"
      doConfirm
      confirmationModal={confirmationModalProps}
    />
  );
}
