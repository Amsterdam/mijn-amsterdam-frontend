import 'react-circular-progressbar/dist/styles.css';

import { Colors, LOGOUT_URL } from 'App.constants';
import { ComponentChildren } from 'App.types';
import classnames from 'classnames';
import { formattedTimeFromSeconds } from 'helpers/App';
import useActivityCounter from 'hooks/activityCounter.hook';
import {
  itemClickPayload,
  itemInteractionPayload,
  trackEvent,
  trackItemPresentation,
} from 'hooks/analytics.hook';
import { CounterProps, useCounter } from 'hooks/timer.hook';
import React, { useEffect, useState, useContext } from 'react';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';

import Modal from '../Modal/Modal';
import styles from './AutoLogoutDialog.module.scss';
import { SessionContext } from 'AppState';

/**
 * This component is essentially a dialog with a countdown timer presented to the user
 * after a certain time {`AUTOLOGOUT_DIALOG_TIMEOUT_SECONDS`}.
 * If the dialog is shown the countdown timer starts to count down from {`AUTOLOGOUT_DIALOG_LAST_CHANCE_COUNTER_SECONDS`}.
 * If the countdown is complete a request to the auth status endpoint is made and the response is put into the state.
 * Whether the Dialog and timer are reset or the User is automatically logged out is dependent on the response and how the app
 * interacts with that. In our case, if the `isAuthenticated` flag is `false`, the app will show the login screen. This logic can
 * be found in App.tsx.
 */
const ONE_SECOND_MS = 1000;
const ONE_MINUTE_SECONDS = 60;
const AUTOLOGOUT_DIALOG_TIMEOUT_SECONDS = 13 * ONE_MINUTE_SECONDS;
const AUTOLOGOUT_DIALOG_LAST_CHANCE_COUNTER_SECONDS =
  2 * ONE_MINUTE_SECONDS + 10; // Add 10 seconds time mismatch range
const SESSION_RENEW_INTERVAL_SECONDS = 30;
const TITLE = 'Wilt u doorgaan?';

export interface AutoLogoutDialogSettings {
  secondsBeforeDialogShow?: number;
  secondsBeforeAutoLogout?: number;
  secondsSessionRenewRequestInterval?: number;
}

export interface ComponentProps {
  children?: ComponentChildren;
  settings?: AutoLogoutDialogSettings;
}

export interface CountDownTimerComponentProps {
  maxCount?: number;
  onMaxCount?: CounterProps['onMaxCount'];
  onTick?: CounterProps['onTick'];
}

function CountDownTimer({
  maxCount = AUTOLOGOUT_DIALOG_LAST_CHANCE_COUNTER_SECONDS,
  onMaxCount,
  onTick,
}: CountDownTimerComponentProps) {
  const { count: progressCountSeconds } = useCounter({
    maxCount,
    onMaxCount,
    onTick,
  });

  const timeDisplay = formattedTimeFromSeconds(maxCount - progressCountSeconds);

  return (
    <span className={styles.CountDownTimer}>
      <CircularProgressbar
        maxValue={maxCount}
        value={progressCountSeconds}
        text={`${timeDisplay}`}
        styles={buildStyles({
          strokeLinecap: 'butt',
          pathTransition: 'none',
          pathColor: Colors.primaryDarkblue,
          textColor: Colors.primaryDarkblue,
          trailColor: Colors.neutralGrey2,
        })}
      />
    </span>
  );
}

const DefaultSettings = {
  secondsBeforeDialogShow: AUTOLOGOUT_DIALOG_TIMEOUT_SECONDS,
  secondsBeforeAutoLogout: AUTOLOGOUT_DIALOG_LAST_CHANCE_COUNTER_SECONDS,
  secondsSessionRenewRequestInterval: SESSION_RENEW_INTERVAL_SECONDS,
};

export default function AutoLogoutDialog({ settings = {} }: ComponentProps) {
  const session = useContext(SessionContext);
  // Will open the dialog if maxCount is reached.
  const nSettings = { ...DefaultSettings, ...settings };
  const { resume, reset } = useCounter({
    maxCount: nSettings.secondsBeforeDialogShow,
    onMaxCount: () => {
      setOpen(true);
    },
  });

  const [isOpen, setOpen] = useState(false);
  const [originalTitle] = useState(document.title);
  const [continueButtonIsVisible, setContinueButtonVisibility] = useState(true);
  const [activityCount] = useActivityCounter(
    nSettings.secondsSessionRenewRequestInterval * ONE_SECOND_MS
  );

  // Renew the remote tma session whenever we detect user activity
  useEffect(() => {
    if (session.isDirty && session.isAuthenticated) {
      resetAutoLogout();
    }
    if (activityCount !== 0 && isOpen !== true) {
      session.refetch();
    }
  }, [activityCount]);

  function resetAutoLogout() {
    setContinueButtonVisibility(true);
    setOpen(false);
    reset();
    resume();
    document.title = originalTitle;
  }

  function showLoginScreen() {
    trackEvent(
      itemInteractionPayload(
        'Redirect',
        'MA_Sessie/Auto_Logout_Dialog',
        'Timeout'
      )
    );
    setContinueButtonVisibility(false);
    window.location.reload();
  }

  function continueUsingApp() {
    // Refetching the session will renew the session for another {AUTOLOGOUT_DIALOG_TIMEOUT_SECONDS + AUTOLOGOUT_DIALOG_LAST_CHANCE_COUNTER_SECONDS} seconds.
    session.refetch();
    resetAutoLogout();
  }

  // On every tick the document title is changed trying to catch the users attention.
  const onTick = (count: number) => {
    document.title = count % 2 === 0 ? TITLE : originalTitle;
  };

  // This effect restores the original page title when the component is unmounted.
  useEffect(() => {
    return () => {
      document.title = originalTitle;
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      trackItemPresentation('MA_Sessie/Auto_Logout_Dialog', 'Timeout');
    }
  }, [isOpen]);

  return (
    <Modal
      title={TITLE}
      isOpen={isOpen}
      contentWidth={450}
      showCloseButton={false}
    >
      <div className={styles.AutoLogoutDialog}>
        <p>
          U bent langer dan{' '}
          {formattedTimeFromSeconds(AUTOLOGOUT_DIALOG_TIMEOUT_SECONDS)} minuten
          niet actief geweest op Mijn Amsterdam.
        </p>
        <p className={styles.TimerText}>
          <CountDownTimer
            maxCount={nSettings.secondsBeforeAutoLogout}
            onMaxCount={showLoginScreen}
            onTick={onTick}
          />
          Voor uw veiligheid wordt u mogelijk automatisch uitgelogd.
        </p>
        <p>Wilt u doorgaan of uitloggen?</p>
        <p>
          {continueButtonIsVisible && (
            <button
              className="action-button secondary continue-button"
              onClick={continueUsingApp}
              data-track={itemClickPayload(
                'MA_Sessie/Auto_Logout_Dialog',
                'Button_doorgaan'
              )}
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
            data-track={itemClickPayload(
              'MA_Sessie/Auto_Logout_Dialog',
              'Button_uitloggen'
            )}
          >
            {continueButtonIsVisible
              ? 'Nu uitloggen'
              : 'Bezig met controleren van uw sessie..'}
          </a>
        </p>
      </div>
    </Modal>
  );
}
