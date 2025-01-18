import { useEffect, useRef, useState } from 'react';

import { Alert, Button, Link, Paragraph } from '@amsterdam/design-system-react';
import classnames from 'classnames';

import styles from './ErrorMessages.module.scss';
import { ApiError } from '../../../universal/types';
import { ALL_ERROR_STATE_KEY } from '../../AppState';
import { LOGOUT_URL } from '../../config/api';
import { useSessionStorage } from '../../hooks/storage.hook';
import { Modal } from '../Modal/Modal';

interface ComponentProps {
  className?: string;
  errors: ApiError[];
  title?: string;
}

export function useErrorMessagesDismissed(
  dismisedKey: string = 'ErrorMessagesDismissed'
) {
  return useSessionStorage(dismisedKey, false);
}

export default function ErrorMessages({
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
        severity="warning"
        className={styles.MessageBar}
        closeable
        closeButtonLabel="Verberg bericht"
        onClose={() => setDismissed(true)}
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
        actions={
          <div>
            <Paragraph className="ams-mb--sm">
              Probeer het later nog eens.{' '}
              {isAllErrorMessage ? (
                <Link rel="noopener noreferrer" href={LOGOUT_URL}>
                  Uitloggen
                </Link>
              ) : (
                ''
              )}
            </Paragraph>
            <Button onClick={() => setModalOpen(false)}>OK</Button>
          </div>
        }
        title={title}
      >
        <div className={styles.ErrorInfo}>
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
