import { useEffect, useState } from 'react';

import { ActionGroup, Paragraph } from '@amsterdam/design-system-react';
import classnames from 'classnames';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

import 'react-circular-progressbar/dist/styles.css';
import styles from './AutoLogoutDialog.module.scss';
import { formattedTimeFromSeconds } from '../../../universal/helpers/date';
import { ComponentChildren } from '../../../universal/types';
import { Colors } from '../../config/app';
import { useSessionValue } from '../../hooks/api/useSessionApi';
import { CounterProps, useCounter } from '../../hooks/timer.hook';
import { Button } from '../Button/Button';
import { Modal } from '../Modal/Modal';

/**
 * This component is essentially a dialog with a countdown timer presented to the user
 * after a certain time {`AUTOLOGOUT_DIALOG_TIMEOUT_SECONDS`}.
 * If the dialog is shown the countdown timer starts to count down from {`AUTOLOGOUT_DIALOG_LAST_CHANCE_COUNTER_SECONDS`}.
 * If the countdown is complete a request to the auth status endpoint is made and the response is put into the state.
 * Whether the Dialog and timer are reset or the User is automatically logged out is dependent on the response and how the app
 * interacts with that. In our case, if the `isAuthenticated` flag is `false`, the app will show the login screen. This logic can
 * be found in App.tsx.
 */
const ONE_MINUTE_SECONDS = 60;
const AUTOLOGOUT_DIALOG_TIMEOUT_MINUTES = 12.5;
const AUTOLOGOUT_DIALOG_TIMEOUT_SECONDS = Math.round(
  AUTOLOGOUT_DIALOG_TIMEOUT_MINUTES * ONE_MINUTE_SECONDS
);
const AUTOLOGOUT_DIALOG_LAST_CHANCE_COUNTER_SECONDS = 2 * ONE_MINUTE_SECONDS;

const SESSION_RENEW_INTERVAL_SECONDS = 300;
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

export const DefaultAutologoutDialogSettings = {
  secondsBeforeDialogShow: AUTOLOGOUT_DIALOG_TIMEOUT_SECONDS,
  secondsBeforeAutoLogout: AUTOLOGOUT_DIALOG_LAST_CHANCE_COUNTER_SECONDS,
  secondsSessionRenewRequestInterval: SESSION_RENEW_INTERVAL_SECONDS,
};

export default function AutoLogoutDialog({ settings = {} }: ComponentProps) {
  const session = useSessionValue();
  // Will open the dialog if maxCount is reached.
  const nSettings = { ...DefaultAutologoutDialogSettings, ...settings };

  const maxCount =
    nSettings.secondsBeforeDialogShow - nSettings.secondsBeforeAutoLogout; // Gives user T time to cancel the automatic logout

  // Count before dialog will show
  const counter = useCounter({
    maxCount,
    onMaxCount: () => {
      setOpen(true);
    },
  });

  const [isOpen, setOpen] = useState(false);
  const [originalTitle] = useState(document.title);
  const [continueButtonIsVisible, setContinueButtonVisibility] = useState(true);

  function showLoginScreen() {
    setContinueButtonVisibility(false);
    session.logout();
  }

  function continueUsingApp() {
    session.refetch();
    document.title = originalTitle;
    counter.reset();
    counter.resume();
    setOpen(false);
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

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      title={TITLE}
      isOpen={isOpen}
      showCloseButton={false}
      actions={
        <ActionGroup>
          {continueButtonIsVisible && (
            <Button
              variant="secondary"
              className="continue-button"
              onClick={continueUsingApp}
            >
              Doorgaan
            </Button>
          )}
          <Button
            variant="secondary-inverted"
            className={classnames('logout-button', styles.LogoutButton)}
            onClick={() => session.logout()}
            onKeyUp={(event) => event.key === 'Enter' && session.logout()}
          >
            {continueButtonIsVisible
              ? 'Nu uitloggen'
              : 'Bezig met controleren van uw sessie..'}
          </Button>
        </ActionGroup>
      }
    >
      <div className={styles.AutoLogoutDialogChildren}>
        <Paragraph className="ams-mb--sm">
          U bent langer dan {Math.floor(maxCount / 60)} minuten niet actief
          geweest op Mijn Amsterdam.
        </Paragraph>
        <Paragraph className={classnames(styles.TimerText, 'ams-mb--sm')}>
          <CountDownTimer
            maxCount={nSettings.secondsBeforeAutoLogout}
            onMaxCount={showLoginScreen}
            onTick={onTick}
          />
          Als u niets doet wordt u automatisch uitgelogd.
        </Paragraph>
        <Paragraph>Wilt u doorgaan of uitloggen?</Paragraph>
      </div>
    </Modal>
  );
}
