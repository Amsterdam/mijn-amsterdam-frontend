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
import classnames from 'classnames';

const ONE_MINUTE_SECONDS = 60;
const AUTOLOGOUT_DIALOG_TIMEOUT_SECONDS = 10 * ONE_MINUTE_SECONDS;
const AUTOLOGOUT_DIALOG_LAST_CHANCE_COUNTER_SECONDS = 2 * ONE_MINUTE_SECONDS;
const TITLE = 'Wilt u doorgaan?';

export interface AutoLogoutDialogSettings {
  secondsBeforeDialogShow?: number;
  secondsBeforeAutoLogout?: number;
}

export interface ComponentProps {
  children?: ComponentChildren;
  session: SessionApiState;
  settings?: AutoLogoutDialogSettings;
}

export interface CirculoComponentProps {
  maxCount?: number;
  onMaxCount?: CounterProps['onMaxCount'];
  onTick?: CounterProps['onTick'];
}

function Circulo({
  maxCount = AUTOLOGOUT_DIALOG_LAST_CHANCE_COUNTER_SECONDS,
  onMaxCount,
  onTick,
}: CirculoComponentProps) {
  const { count: progressCountSeconds } = useCounter({
    maxCount,
    onMaxCount,
    onTick,
  });

  const timeDisplay = formattedTimeFromSeconds(maxCount - progressCountSeconds);

  return (
    <span className={styles.Circulo}>
      <CircularProgressbar
        maxValue={maxCount}
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
  settings = {
    secondsBeforeDialogShow: AUTOLOGOUT_DIALOG_TIMEOUT_SECONDS,
    secondsBeforeAutoLogout: AUTOLOGOUT_DIALOG_LAST_CHANCE_COUNTER_SECONDS,
  },
}: ComponentProps) {
  const { resume, reset } = useCounter({
    maxCount: settings.secondsBeforeDialogShow,
    onMaxCount: () => {
      setOpen(true);
    },
  });

  const [isOpen, setOpen] = useState(false);
  const [originalTitle] = useState(document.title);
  const [continueButtonIsVisible, setContinueButtonVisibility] = useState(true);

  function showLoginScreen() {
    setContinueButtonVisibility(false);
    session.refetch();
  }

  function continueUsingApp() {
    session.refetch();
    setOpen(false);
    reset();
    resume();
  }

  const onTick = (count: number) => {
    document.title = count % 2 === 0 ? TITLE : originalTitle;
  };

  // This effect just restores the original page title when the component is unmounted.
  useEffect(
    () => () => {
      document.title = originalTitle;
    },
    []
  );

  return (
    <Modal
      title={TITLE}
      isOpen={isOpen}
      contentWidth={450}
      showCloseButton={false}
    >
      <div className={styles.AutoLogoutDialog}>
        <p>
          U bent langer dan 10 minuten niet actief geweest op Mijn Amsterdam.
        </p>
        <p className={styles.TimerText}>
          <Circulo
            maxCount={settings.secondsBeforeAutoLogout}
            onMaxCount={showLoginScreen}
            onTick={onTick}
          />
          Voor uw veiligheid wordt u automatisch uitgelogd.
        </p>
        <p>Wilt u doorgaan of uitloggen?</p>
        <p>
          {continueButtonIsVisible && (
            <button
              className="action-button secondary continue-button"
              onClick={continueUsingApp}
            >
              Doorgaan
            </button>
          )}
          <a
            className={classnames(
              'action-button line-only secondary logout-button',
              !continueButtonIsVisible && 'disabled'
            )}
            href={LOGOUT_URL}
          >
            {continueButtonIsVisible
              ? 'Nu uitloggen'
              : 'U wordt nu automatisch uitgelogd...'}
          </a>
        </p>
      </div>
    </Modal>
  );
}
