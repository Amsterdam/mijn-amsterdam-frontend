import classnames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { ALL_ERROR_STATE_KEY } from '../../AppState';
import { IconAlert, IconClose } from '../../assets/icons';
import { useSessionValue } from '../../hooks/api/useSessionApi';
import { useSessionStorage } from '../../hooks/storage.hook';
import { Button, IconButton, LinkdInline } from '../Button/Button';
import Modal from '../Modal/Modal';
import styles from './ErrorMessages.module.scss';

export interface Error {
  name: string;
  error: string;
  stateKey: string;
}

interface ComponentProps {
  className?: string;
  errors: Error[];
}

export function useErrorMessagesDismissed() {
  return useSessionStorage('ErrorMessagesDismissed', false);
}

export default function ErrorMessages({ className, errors }: ComponentProps) {
  const el = useRef(null);
  const session = useSessionValue();
  const isAllErrorMessage = errors.some(
    error => error.stateKey === ALL_ERROR_STATE_KEY
  );
  const [isModalOpen, setModalOpen] = useState(false);
  const top = el.current
    ? (el.current! as HTMLElement).getBoundingClientRect().top
    : 0;
  const [isDismissed, setDismissed] = useErrorMessagesDismissed();

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
          <IconAlert aria-hidden="true" className={styles.AlertIcon} /> U ziet
          misschien niet al uw gegevens.{' '}
          <Button
            lean={true}
            variant="inline"
            onClick={() => setModalOpen(true)}
            aria-label="Meer informatie over waarom u mischien niet alle gegevens ziet."
          >
            Meer informatie
          </Button>
          .
        </span>

        <IconButton
          icon={!isDismissed ? IconClose : IconAlert}
          className={classnames(
            styles.ToggleButton,
            isDismissed && styles.isDismissed
          )}
          onClick={() => setDismissed(!isDismissed)}
          aria-label={isDismissed ? 'Toon bericht' : 'Verberg bericht'}
        />
      </p>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="U ziet misschien niet al uw gegevens"
        contentVerticalPosition={el.current ? Math.max(top, 0) : 'center'}
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
          <p>
            Probeer het later nog eens.{' '}
            {isAllErrorMessage ? (
              <LinkdInline
                external={true}
                role="button"
                onClick={() => session.logout()}
              >
                Uitloggen
              </LinkdInline>
            ) : (
              ''
            )}
          </p>
          <Button onClick={() => setModalOpen(false)}>OK</Button>
        </div>
      </Modal>
    </div>
  );
}
