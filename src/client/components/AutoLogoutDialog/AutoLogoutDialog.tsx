import { ReactNode, useEffect, useRef, useState } from 'react';

import { ActionGroup, Button, Paragraph } from '@amsterdam/design-system-react';
import classnames from 'classnames';
import { differenceInMilliseconds } from 'date-fns';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

import 'react-circular-progressbar/dist/styles.css';

import styles from './AutoLogoutDialog.module.scss';
import { formattedTimeFromSeconds } from '../../../universal/helpers/date';
import {
  LOGIN_URL_DIGID,
  LOGIN_URL_EHERKENNING,
  LOGOUT_URL,
} from '../../config/api';
import { Colors } from '../../config/app';
import { ONE_SECOND_MS, useSessionValue } from '../../hooks/api/useSessionApi';
import { CounterProps, useCounter } from '../../hooks/timer.hook';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { MaButtonLink } from '../MaLink/MaLink';
import { Modal } from '../Modal/Modal';

const TITLE = 'Wilt u ingelogd blijven op Mijn Amsterdam?';
const ONE_MINUTE_SECONDS = 60;

export interface AutoLogoutDialogProps {
  children?: ReactNode;
  expiresAtMilliseconds: number;
  lastChanceBeforeAutoLogoutSeconds?: number;
  asynRefreshEnabled?: boolean;
}

export interface CountDownTimerComponentProps {
  maxCount: number;
  onMaxCount?: CounterProps['onMaxCount'];
  onTick?: CounterProps['onTick'];
}

function CountDownTimer({
  maxCount,
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

const autoLogoutLoggingEnabled =
  window.localStorage.getItem('AUTO_LOGOUT_TIMER_LOGGING') === 'true';

function getExpiresInMilliseconds(expiresAtMilliseconds: number): number {
  return differenceInMilliseconds(new Date(expiresAtMilliseconds), new Date());
}

function getExpiresInSeconds(expiresAtMilliseconds: number): number {
  return Math.floor(
    getExpiresInMilliseconds(expiresAtMilliseconds) / ONE_SECOND_MS
  );
}

function getOpensDialogInMilliseconds(
  expiresAtMilliseconds: number,
  lastChanceBeforeAutoLogoutSeconds: number
): number {
  const lastChaceInMilliseconds =
    lastChanceBeforeAutoLogoutSeconds * ONE_SECOND_MS;
  const millisecondsBeforeAutoLogoutDialogOpens =
    getExpiresInMilliseconds(expiresAtMilliseconds) - lastChaceInMilliseconds;

  return millisecondsBeforeAutoLogoutDialogOpens;
}

export function AutoLogoutDialog({
  asynRefreshEnabled = false,
  expiresAtMilliseconds,
  lastChanceBeforeAutoLogoutSeconds = 2 * ONE_MINUTE_SECONDS, // 120 seconds
}: AutoLogoutDialogProps) {
  const session = useSessionValue();
  const profileType = useProfileTypeValue();

  // Will open the dialog if secondsBeforeAutoLogoutDialogOpens is reached.
  const millisecondsBeforeAutoLogoutDialogOpens = getOpensDialogInMilliseconds(
    expiresAtMilliseconds,
    lastChanceBeforeAutoLogoutSeconds
  );

  const [isOpen, setOpen] = useState(false);
  const [originalTitle, setOriginalDocumentTitle] = useState(document.title);
  const [continueButtonIsVisible, setContinueButtonVisibility] = useState(true);

  function logtime() {
    // eslint-disable-next-line no-console
    console.log(
      'Dialog opens in %s seconds, expires in %s seconds at %s',
      formattedTimeFromSeconds(
        getExpiresInSeconds(expiresAtMilliseconds) -
          lastChanceBeforeAutoLogoutSeconds
      ),
      formattedTimeFromSeconds(getExpiresInSeconds(expiresAtMilliseconds)),
      new Date(expiresAtMilliseconds)
    );
  }

  const intervalId = useRef<number | undefined>(undefined);
  const timeoutId = useRef<number | undefined>(undefined);

  useEffect(() => {
    clearInterval(intervalId.current);
    clearTimeout(timeoutId.current);

    if (millisecondsBeforeAutoLogoutDialogOpens > 0) {
      setOpen(false);
    }

    if (autoLogoutLoggingEnabled) {
      logtime();

      intervalId.current = window.setInterval(() => {
        logtime();
      }, ONE_SECOND_MS);
    }

    // Open the dialog when the time is up.
    timeoutId.current = window.setTimeout(
      () => {
        clearInterval(intervalId.current);
        clearTimeout(timeoutId.current);
        setOpen(true);
      },
      Math.max(millisecondsBeforeAutoLogoutDialogOpens, 0)
    );

    return () => {
      clearInterval(intervalId.current);
      clearTimeout(timeoutId.current);
    };
  }, [millisecondsBeforeAutoLogoutDialogOpens]);

  const maxCountInSeconds = Math.min(
    lastChanceBeforeAutoLogoutSeconds,
    getExpiresInSeconds(expiresAtMilliseconds)
  );

  function showLoginScreen() {
    setContinueButtonVisibility(false);
    session.logout();
  }

  // On every tick the document title is changed trying to catch the users attention.
  const onTick = (count: number) => {
    document.title = count % 2 === 0 ? TITLE : originalTitle;
  };

  // This effect restores the original page title when the component is unmounted.
  useEffect(() => {
    if (isOpen) {
      setOriginalDocumentTitle(document.title);
    }
    return () => {
      document.title = originalTitle;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const continueLink = `${profileType === 'private' ? LOGIN_URL_DIGID : LOGIN_URL_EHERKENNING}?returnTo=mams-frontend-route&route=${encodeURIComponent(window.location.pathname)}`;
  const logoutLink = LOGOUT_URL;
  const logoutLabel = continueButtonIsVisible
    ? 'Nu uitloggen'
    : 'Bezig met controleren van uw sessie..';

  return (
    <Modal
      title={TITLE}
      isOpen
      showCloseButton={false}
      closeOnEscape={false}
      closeOnClickOutside={false}
      actions={
        <ActionGroup>
          {continueButtonIsVisible && (
            <>
              {asynRefreshEnabled ? (
                <Button
                  variant="primary"
                  className="continue-button"
                  disabled={session.isLoading}
                  onClick={() => {
                    session.refetch();
                    return false;
                  }}
                >
                  Doorgaan
                </Button>
              ) : (
                <MaButtonLink
                  variant="primary"
                  className="continue-button"
                  href={continueLink}
                >
                  Doorgaan
                </MaButtonLink>
              )}
            </>
          )}
          <MaButtonLink
            id="logout-button"
            variant="secondary"
            className={classnames('logout-button', styles.LogoutButton)}
            href={logoutLink}
          >
            {logoutLabel}
          </MaButtonLink>
        </ActionGroup>
      }
    >
      <div className={styles.AutoLogoutDialogChildren}>
        <Paragraph className={classnames(styles.TimerText, 'ams-mb--sm')}>
          <CountDownTimer
            maxCount={maxCountInSeconds}
            onMaxCount={showLoginScreen}
            onTick={onTick}
          />
          Als u niets doet wordt u automatisch uitgelogd.
        </Paragraph>
      </div>
    </Modal>
  );
}
