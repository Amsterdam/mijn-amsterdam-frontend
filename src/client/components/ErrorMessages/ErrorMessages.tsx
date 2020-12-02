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
  const top = el.current
    ? (el.current! as HTMLElement).getBoundingClientRect().top
    : 0;
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
          <Button
            lean={true}
            variant="inline"
            onClick={() => setModalOpen(true)}
            aria-label="Meer informatie over waarom u misschien niet alle gegevens ziet."
          >
            Meer informatie
          </Button>
          .
        </span>

        <IconButton
          icon={IconClose}
          className={styles.CloseButton}
          onClick={() => setDismissed(true)}
          aria-label="Verberg bericht"
        />
      </p>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={title}
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
