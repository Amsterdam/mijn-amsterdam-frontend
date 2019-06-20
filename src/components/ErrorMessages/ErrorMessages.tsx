import { StateKey } from 'AppState';
import { ReactComponent as AlertIcon } from 'assets/icons/Alert.svg';
import classnames from 'classnames';
import ButtonLinkStyle from 'components/ButtonLink/ButtonLink.module.scss';
import Modal from 'components/Modal/Modal';
import React, { useRef, useState } from 'react';

import styles from './ErrorMessages.module.scss';

export interface Error {
  name: string;
  error: string;
}

export type ErrorMessageMap = Partial<Record<StateKey, Error>>;

interface ComponentProps {
  className?: any;
  errors: Error[];
}

export default function ErrorMessages({ className, errors }: ComponentProps) {
  const el = useRef(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const top = el.current
    ? (el.current! as HTMLElement).getBoundingClientRect().top
    : 0;
  return (
    <div ref={el} className={classnames(styles.ErrorMessages, className)}>
      <p className={styles.MessageBar}>
        <span>
          <AlertIcon className={styles.AlertIcon} /> U ziet misschien niet al uw
          gegevens
        </span>
        <button
          className={classnames(
            ButtonLinkStyle.ButtonLinkButtonReset,
            styles.ActionButton
          )}
          onClick={() => setModalOpen(true)}
        >
          Meer informatie
        </button>
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
          <button className="action-button" onClick={() => setModalOpen(false)}>
            Ok
          </button>
        </div>
      </Modal>
    </div>
  );
}
