import { AppContext, StateKey } from 'AppState';
import { ReactComponent as AlertIcon } from 'assets/icons/Alert.svg';
import classnames from 'classnames';
import ButtonLinkStyle from 'components/ButtonLink/ButtonLink.module.scss';
import Modal from 'components/Modal/Modal';
import { entries } from 'helpers/App';
import React, { DOMElement, useContext, useRef, useState } from 'react';

import styles from './ErrorMessages.module.scss';

interface Error {
  name: string;
  error: string;
}

interface ComponentProps {
  className?: any;
}

type ErrorMessageMap = Partial<Record<StateKey, Error>>;

const errorMessageMap: ErrorMessageMap = {
  BRP: {
    name: 'Persoonsgegevens',
    error: 'Communicatie met api mislukt.',
  },
  MY_UPDATES: {
    name: 'Mijn meldingen',
    error: 'Communicatie met api mislukt.',
  },
  MY_CASES: {
    name: 'Mijn lopende aanvragen',
    error: 'Communicatie met api mislukt.',
  },
  MY_TIPS: {
    name: 'Mijn tips',
    error: 'Communicatie met api mislukt.',
  },
  WMO: {
    name: 'Zorg',
    error: 'Communicatie met api mislukt.',
  },
  FOCUS: {
    name: 'Stadspas of Bijstandsuitkering',
    error: 'Communicatie met api mislukt.',
  },
  ERFPACHT: {
    name: 'Erfpacht',
    error: 'Communicatie met api mislukt.',
  },
};

const excludedApiKeys: StateKey[] = ['MY_CHAPTERS', 'SESSION'];

export default function ErrorMessages({ className }: ComponentProps) {
  const appState = useContext(AppContext);
  const el = useRef(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const errors = entries(appState)
    .filter(
      ([stateKey, state]) =>
        !excludedApiKeys.includes(stateKey) &&
        'isError' in state &&
        state.isError
    )
    .map(
      ([stateKey]) =>
        errorMessageMap[stateKey] || {
          name: stateKey,
          error: 'Communicatie met api mislukt.',
        }
    );

  return (
    <div ref={el} className={classnames(styles.ErrorMessages, className)}>
      <p className={styles.MessageBar}>
        <span>
          <AlertIcon className={styles.AlertIcon} /> U ziet misschien niet al uw
          gegevens
        </span>
        <button
          className={ButtonLinkStyle.ButtonLinkButtonReset}
          onClick={() => setModalOpen(true)}
        >
          Meer informatie
        </button>
      </p>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="U ziet misschien niet al uw gegevens"
        contentVerticalPosition={
          el.current
            ? (el.current! as HTMLElement).getBoundingClientRect().top
            : 'center'
        }
      >
        <div className={styles.ErrorInfo}>
          <p>De volgende gegevens kunnen niet opgehaald worden:</p>
          <ul className={styles.ErrorList}>
            {errors.map(({ name, error }, index) => {
              return (
                <li key={`${name}-${index}`}>
                  {name}: {error}
                </li>
              );
            })}
          </ul>
          <p>
            Probeer het later nog eens. Bel anders naar 0000000 voor hulp en
            ondersteuning.
          </p>
          <button className="action-button" onClick={() => setModalOpen(false)}>
            Ok dan maar
          </button>
        </div>
      </Modal>
    </div>
  );
}
