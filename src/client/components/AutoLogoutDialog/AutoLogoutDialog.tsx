import { useEffect, useState } from 'react';

import { ActionGroup, Paragraph } from '@amsterdam/design-system-react';
import classnames from 'classnames';
import { differenceInSeconds } from 'date-fns/differenceInSeconds';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

import 'react-circular-progressbar/dist/styles.css';

import styles from './AutoLogoutDialog.module.scss';
import { formattedTimeFromSeconds } from '../../../universal/helpers/date';
import { ComponentChildren } from '../../../universal/types';
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

export interface ComponentProps {
  children?: ComponentChildren;
  expiresAtMilliseconds: number;
  lastChanceBeforeAutoLogoutSeconds?: number;
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

export function getExpiresInSeconds(expiresAtMilliseconds: number): number {
  return differenceInSeconds(new Date(expiresAtMilliseconds), new Date());
}

export default function AutoLogoutDialog({
  expiresAtMilliseconds,
  lastChanceBeforeAutoLogoutSeconds = 2 * ONE_MINUTE_SECONDS,
}: ComponentProps) {
  const session = useSessionValue();
  const profileType = useProfileTypeValue();

  // Will open the dialog if secondsBeforeAutoLogoutDialogOpens is reached.
  const secondsBeforeAutoLogoutDialogOpens =
    getExpiresInSeconds(expiresAtMilliseconds) -
    lastChanceBeforeAutoLogoutSeconds;

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

  useEffect(() => {
    let intervalId: number;
    if (autoLogoutLoggingEnabled) {
      logtime();
      intervalId = window.setInterval(() => {
        logtime();
      }, ONE_SECOND_MS);
    }

    const timeoutId = setTimeout(
      () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
        setOpen(true);
      },
      Math.max(secondsBeforeAutoLogoutDialogOpens * ONE_SECOND_MS, 0)
    );

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [secondsBeforeAutoLogoutDialogOpens, expiresAtMilliseconds]);

  const maxCount = Math.min(
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

  const continueLink =
    profileType === 'private' ? LOGIN_URL_DIGID : LOGIN_URL_EHERKENNING;
  const logoutLink = LOGOUT_URL;
  const logoutLabel = continueButtonIsVisible
    ? 'Nu uitloggen'
    : 'Bezig met controleren van uw sessie..';

  return (
    <Modal
      title={TITLE}
      isOpen
      showCloseButton={false}
      actions={
        <ActionGroup>
          {continueButtonIsVisible && (
            <MaButtonLink
              variant="primary"
              className="continue-button"
              href={continueLink}
            >
              Doorgaan
            </MaButtonLink>
          )}
          <MaButtonLink
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
            maxCount={maxCount}
            onMaxCount={showLoginScreen}
            onTick={onTick}
          />
          Als u niets doet wordt u automatisch uitgelogd.
        </Paragraph>
      </div>
    </Modal>
  );
}
