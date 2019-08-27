import React, { useEffect } from 'react';
import styles from './Tutorial.module.scss';
import classnames from 'classnames';
import { ComponentChildren } from 'App.types';
import { ReactComponent as ArrowIcon } from 'assets/icons/Arrow__primary-white.svg';
import { usePhoneScreen } from 'hooks/media.hook';

export interface ComponentProps {
  children?: ComponentChildren;
  toggleTutorial: Function;
}

export default function Tutorial({ toggleTutorial }: ComponentProps) {
  const myUpdatesHeaderPos = document
    .getElementById('MyUpdatesHeader')!
    .getBoundingClientRect();
  const myChaptersHeaderPos = document
    .getElementById('MyChaptersHeader')!
    .getBoundingClientRect();
  const myCasesHeaderPos = document
    .getElementById('MyCasesHeader')!
    .getBoundingClientRect();
  const myAreaHeaderPos = document
    .getElementById('MyAreaHeader')!
    .getBoundingClientRect();
  const myTipsHeaderPos = document
    .getElementById('MyTipsHeader')!
    .getBoundingClientRect();

  function handleEscapeKey(e: KeyboardEvent) {
    if (e.keyCode === 27) {
      toggleTutorial();
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  });

  return (
    <div
      className={styles.Tutorial}
      style={{ height: document.body.clientHeight + 40 }}
    >
      <div
        className={classnames(styles.TutorialItem, styles.MyUpdatesItem)}
        style={{
          top: myUpdatesHeaderPos.top,
          left: myUpdatesHeaderPos.left,
        }}
      >
        Hier ziet u nieuwe berichten van onze afdelingen die uw aandacht vragen
        <br />
        <ArrowIcon />
      </div>
      <div
        className={classnames(styles.TutorialItem, styles.MyChaptersItem)}
        style={{
          top: myChaptersHeaderPos.top,
          left: myChaptersHeaderPos.left,
        }}
      >
        {!usePhoneScreen() && (
          <>
            <ArrowIcon />
            <br />
          </>
        )}
        Dit zijn de onderwerpen waarover u iets heeft bij de gemeente
        {usePhoneScreen() && (
          <>
            <br />
            <ArrowIcon />
          </>
        )}
      </div>
      <div
        className={classnames(styles.TutorialItem, styles.MyCasesItem)}
        style={{
          top: myCasesHeaderPos.top,
          left: myCasesHeaderPos.left,
        }}
      >
        {!usePhoneScreen() && (
          <>
            <ArrowIcon />
            <br />
          </>
        )}
        Dit is een overzicht van uw lopende aanvragen of wijzigingen
        {usePhoneScreen() && (
          <>
            <br />
            <ArrowIcon />
          </>
        )}
      </div>
      <div
        className={classnames(styles.TutorialItem, styles.MyAreaItem)}
        style={{
          top: myAreaHeaderPos.top,
          left: myAreaHeaderPos.left,
        }}
      >
        Hier ziet u informatie van de gemeente, bijvoorbeeld over afval,
        parkeren en bekendmakingen
        {usePhoneScreen && (
          <>
            <br />
            <ArrowIcon />
          </>
        )}
      </div>
      <div
        className={classnames(styles.TutorialItem, styles.MyTipsItem)}
        style={{
          top: myTipsHeaderPos.top,
          left: myTipsHeaderPos.left,
        }}
      >
        <ArrowIcon />
        <br />
        Hier geven wij u handige tips, bijvoorbeeld over de regelingen en
        voorzieningen van de gemeente
      </div>
    </div>
  );
}
