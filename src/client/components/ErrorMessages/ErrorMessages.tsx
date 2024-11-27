import { useEffect, useRef, useState } from 'react';

import { Link, Button } from '@amsterdam/design-system-react';
import classnames from 'classnames';

import styles from './ErrorMessages.module.scss';
import { ApiError } from '../../../universal/types';
import { ALL_ERROR_STATE_KEY } from '../../AppState';
import { IconAlert, IconClose } from '../../assets/icons';
import { useSessionValue } from '../../hooks/api/useSessionApi';
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
  const session = useSessionValue();
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
      <p className={styles.MessageBar}>
        <span className={styles.MessageBarInner}>
          <IconAlert aria-hidden="true" className={styles.AlertIcon} /> {title}{' '}
          <Link
            variant="inline"
            onClick={() => setModalOpen(true)}
            aria-label="Meer informatie over waarom u misschien niet alle gegevens ziet."
          >
            Meer informatie
          </Link>
          .
        </span>

        <Button
          icon={IconClose}
          iconOnly
          className={styles.CloseButton}
          variant="tertiary"
          onClick={() => setDismissed(true)}
          aria-label="Verberg bericht"
        />
      </p>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        actions={
          <div>
            <p>
              Probeer het later nog eens.{' '}
              {isAllErrorMessage ? (
                <Link
                  variant="inline"
                  role="button"
                  onClick={() => session.logout()}
                >
                  Uitloggen
                </Link>
              ) : (
                ''
              )}
            </p>
            <Button onClick={() => setModalOpen(false)}>OK</Button>
          </div>
        }
        title={title}
      >
        <div className={styles.ErrorInfo}>
          <p>Deze gegevens kunnen wij nu niet voor u ophalen:</p>
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
