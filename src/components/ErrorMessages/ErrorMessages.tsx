import { StateKey } from 'AppState';
import { ReactComponent as AlertIcon } from 'assets/icons/Alert.svg';
import { ReactComponent as CloseIcon } from 'assets/icons/Close.svg';
import classnames from 'classnames';
import Modal from 'components/Modal/Modal';
import React, { useRef, useState } from 'react';

import styles from './ErrorMessages.module.scss';
import { Button, IconButton } from 'components/Button/Button';
import { useSessionStorage } from 'hooks/storage.hook';

export interface Error {
  name: string;
  error: string;
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
  const [isModalOpen, setModalOpen] = useState(false);
  const top = el.current
    ? (el.current! as HTMLElement).getBoundingClientRect().top
    : 0;
  const [isDismissed, setDismissed] = useErrorMessagesDismissed();

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
          <AlertIcon aria-hidden="true" className={styles.AlertIcon} /> U ziet
          misschien niet al uw gegevens{' '}
          <Button
            lean={true}
            variant="inline"
            onClick={() => setModalOpen(true)}
            aria-label="Meer informatie over waarom u mischien niet alle gegevens ziet."
          >
            meer informatie
          </Button>
          .
        </span>

        <IconButton
          icon={!isDismissed ? CloseIcon : AlertIcon}
          className={styles.ToggleButton}
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
          <p>De volgende gegevens kunnen niet opgehaald worden:</p>
          <ul className={styles.ErrorList}>
            {errors.map(({ name, error }, index) => {
              return <li key={`${name}-${index}`}>{name}</li>;
            })}
          </ul>
          <p>
            {/* TODO: Arrange correct text here */}
            Probeer het later nog eens.
          </p>
          <Button onClick={() => setModalOpen(false)}>Oké</Button>
        </div>
      </Modal>
    </div>
  );
}
