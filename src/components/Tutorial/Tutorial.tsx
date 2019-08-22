import React from 'react';
import styles from './Tutorial.module.scss';
import classnames from 'classnames';
import { ComponentChildren } from 'App.types';
import { ReactComponent as ArrowIcon } from 'assets/icons/Arrow__primary-white.svg';

export interface ComponentProps {
  children?: ComponentChildren;
}

export default function Tutorial({ children }: ComponentProps) {
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

  return (
    <div
      className={styles.Tutorial}
      style={{ height: document.body.clientHeight }}
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
        <ArrowIcon />
        <br />
        Dit zijn de onderwerpen waarover u iets heeft bij de gemeente
      </div>
      <div
        className={classnames(styles.TutorialItem, styles.MyCasesItem)}
        style={{
          top: myCasesHeaderPos.top,
          left: myCasesHeaderPos.left,
        }}
      >
        <ArrowIcon />
        <br />
        Dit is een overzicht van uw lopende aanvragen of wijzigingen
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
        <br />
        <ArrowIcon />
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
