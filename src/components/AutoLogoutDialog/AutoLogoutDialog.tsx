import 'react-circular-progressbar/dist/styles.css';

import { ComponentChildren } from 'App.types';
import { formattedTimeFromSeconds } from 'helpers/App';
import { SessionApiState } from 'hooks/api/session.api.hook';
import { CounterProps, useCounter } from 'hooks/timer.hook';
import React, { useState, useEffect } from 'react';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';

import { Colors, LOGOUT_URL } from '../../App.constants';
import Modal from '../Modal/Modal';
import styles from './AutoLogoutDialog.module.scss';

const ONE_MINUTE_SECONDS = 60;
const AUTOLOGOUT_DIALOG_TIMEOUT_SECONDS = 10 * ONE_MINUTE_SECONDS;
const AUTOLOGOUT_DIALOG_LAST_CHANCE_COUNTER_SECONDS = 2 * ONE_MINUTE_SECONDS;

export interface ComponentProps {
  children?: ComponentChildren;
  session: SessionApiState;
}

export interface CirculoComponentProps {
  onMaxCount?: CounterProps['onMaxCount'];
  timeoutSeconds?: number;
}

function Circulo({
  timeoutSeconds = AUTOLOGOUT_DIALOG_LAST_CHANCE_COUNTER_SECONDS,
  onMaxCount,
}: CirculoComponentProps) {
  const [originalTitle] = useState(document.title);
  const { count: progressCountSeconds } = useCounter({
    maxCount: timeoutSeconds,
    onMaxCount,
    onTick: count => {
      document.title = count % 2 === 0 ? 'Wilt u doorgaan?' : originalTitle;
    },
  });

  const timeDisplay = formattedTimeFromSeconds(
    timeoutSeconds - progressCountSeconds
  );

  useEffect(
    () => () => {
      document.title = originalTitle;
    },
    []
  );

  return (
    <span className={styles.Circulo}>
      <CircularProgressbar
        maxValue={timeoutSeconds}
        value={progressCountSeconds}
        text={`${timeDisplay}`}
        styles={buildStyles({
          strokeLinecap: 'butt',
          pathTransition: 'none',
          pathColor: Colors.primaryDarkblue,
          textColor: Colors.primaryDarkblue,
        })}
      />
    </span>
  );
}

export default function AutoLogoutDialog({
  children,
  session,
}: ComponentProps) {
  const { resume, reset } = useCounter({
    startPaused: false,
    startCountAt: 0,
    maxCount: AUTOLOGOUT_DIALOG_TIMEOUT_SECONDS, // 10 minutes
    onMaxCount: () => {
      setOpen(true);
    },
  });

  const [isOpen, setOpen] = useState(false);

  function showLoginScreen() {
    session.refetch();
  }

  function continueUsingApp() {
    setOpen(false);
    reset();
    resume();
  }

  return (
    <Modal
      title={'Wilt u doorgaan?'}
      isOpen={isOpen}
      contentWidth={450}
      showCloseButton={false}
    >
      <div className={styles.AutoLogoutDialog}>
        <p>
          U bent langer dan 10 minuten niet actief geweest op Mijn Amsterdam.
        </p>
        <p className={styles.TimerText}>
          <Circulo onMaxCount={showLoginScreen} />
          Voor uw veiligheid wordt u automatisch uitgelogd.
        </p>
        <p>Wilt u doorgaan of uitloggen?</p>
        <p>
          <button
            className="action-button secondary"
            onClick={continueUsingApp}
          >
            Doorgaan
          </button>
          <a className="action-button line-only secondary" href={LOGOUT_URL}>
            Nu uitloggen
          </a>
        </p>
      </div>
    </Modal>
  );
}
