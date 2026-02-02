import { useEffect, useMemo, useRef, useState } from 'react';

import { Alert, Button, Link, Paragraph } from '@amsterdam/design-system-react';
import classnames from 'classnames';

import styles from './ErrorMessages.module.scss';
import { ApiError } from '../../../universal/types/App.types';
import { ALL_ERROR_STATE_KEY } from '../../AppState';
import { getApiErrors, LOGOUT_URL } from '../../config/api';
import { useAppStateGetter } from '../../hooks/useAppStateStore';
import { Modal } from '../Modal/Modal';

interface ComponentProps {
  className?: string;
  errors: ApiError[];
  title?: string;
}

export function ErrorMessagesContent({
  className,
  errors,
  title = 'U ziet misschien niet al uw gegevens.',
}: ComponentProps) {
  const el = useRef(null);
  const isAllErrorMessage = errors.some(
    (error) => error.stateKey === ALL_ERROR_STATE_KEY
  );
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isAllErrorMessage) {
      setModalOpen(true);
    }
  }, [isAllErrorMessage]);

  return (
    <div
      ref={el}
      className={classnames(
        styles.ErrorMessages,
        isDismissed && styles.Dismissed,
        className
      )}
    >
      <Alert
        className={styles.MessageBar}
        closeable
        closeButtonLabel="Verberg bericht"
        onClose={() => setDismissed(true)}
        heading="Let op!"
        headingLevel={2}
      >
        <Paragraph>
          {title}{' '}
          <Link
            href="/"
            onClick={(event) => {
              event.preventDefault();
              setModalOpen(true);
            }}
            aria-label="Meer informatie over waarom u misschien niet alle gegevens ziet."
          >
            Meer informatie
          </Link>
        </Paragraph>
      </Alert>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        pollingQuerySelector="#ok-button"
        actions={
          <div>
            <Paragraph className="ams-mb-m">
              Probeer het later nog eens.{' '}
              {isAllErrorMessage ? (
                <Link rel="noopener noreferrer" href={LOGOUT_URL}>
                  Uitloggen
                </Link>
              ) : (
                ''
              )}
            </Paragraph>
            <Button id="ok-button" onClick={() => setModalOpen(false)}>
              OK
            </Button>
          </div>
        }
        title={title}
      >
        <div>
          <Paragraph>
            Deze gegevens kunnen wij nu niet voor u ophalen:
          </Paragraph>
          <ul className={styles.ErrorList}>
            {errors.map(({ name, error }, index) => {
              return (
                <li key={`${name}-${index}`}>
                  {name} <span className={styles.ErrorFromServer}>{error}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </Modal>
    </div>
  );
}

export function useErrorMessages() {
  const appState = useAppStateGetter();
  const errors = useMemo(() => getApiErrors(appState), [appState]);
  const hasErrors = !!errors.length;
  return { errors, hasErrors };
}

export function ErrorMessages() {
  const { errors, hasErrors } = useErrorMessages();
  return hasErrors && <ErrorMessagesContent errors={errors} />;
}
