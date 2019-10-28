import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './Tutorial.module.scss';
import classnames from 'classnames';
import { ComponentChildren, Unshaped } from 'App.types';
import { ReactComponent as ArrowIcon } from 'assets/icons/Arrow__primary-white.svg';
import { usePhoneScreen } from 'hooks/media.hook';
import { throttle } from 'throttle-debounce';
import useModalRoot from 'hooks/modalRoot.hook';

export interface ComponentProps {
  children?: ComponentChildren;
  toggleTutorial: Function;
}

function calcPos() {
  const scrollTop = document.documentElement.scrollTop;

  return [
    'MyUpdatesHeader',
    'MyChaptersHeader',
    'MyCasesHeader',
    'MyAreaHeader',
    'MyTipsHeader',
  ].reduce((acc, id) => {
    const rectEl = document.getElementById(id);
    let rect = {
      top: 0,
      left: 0,
    };
    if (rectEl && rectEl.getBoundingClientRect) {
      rect = rectEl.getBoundingClientRect();
    }
    return {
      ...acc,
      [id]: {
        top: scrollTop + rect.top,
        left: rect.left,
      },
    };
  }, {});
}

export default function Tutorial({ toggleTutorial }: ComponentProps) {
  const [pos, setPos]: [Unshaped, (pos: Unshaped) => void] = useState({});

  function handleEscapeKey(e: KeyboardEvent) {
    if (e.keyCode === 27) {
      toggleTutorial();
    }
  }

  const resizeThrottled = throttle(20, () => {
    setPos(calcPos());
  });

  useEffect(() => {
    window.addEventListener('resize', resizeThrottled);
    document.addEventListener('keydown', handleEscapeKey);

    setPos(calcPos());

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      window.removeEventListener('resize', resizeThrottled);
    };
  }, []);

  const isPhone = usePhoneScreen();

  // Check if positions are calculated
  return pos.MyUpdatesHeader ? (
    ReactDOM.createPortal(
      <div
        className={styles.Tutorial}
        style={{ height: document.body.clientHeight }}
      >
        <div
          className={classnames(styles.TutorialItem, styles.MyUpdatesItem)}
          style={{
            top: pos.MyUpdatesHeader.top,
            left: pos.MyUpdatesHeader.left,
          }}
        >
          Hier ziet u nieuwe berichten van onze afdelingen die uw aandacht
          vragen
          <br />
          <ArrowIcon />
        </div>
        <div
          className={classnames(styles.TutorialItem, styles.MyChaptersItem)}
          style={{
            top: pos.MyChaptersHeader.top,
            left: pos.MyChaptersHeader.left,
          }}
        >
          {!isPhone && (
            <>
              <ArrowIcon />
              <br />
            </>
          )}
          Dit zijn de onderwerpen waarover u iets heeft bij de gemeente
          {isPhone && (
            <>
              <br />
              <ArrowIcon />
            </>
          )}
        </div>
        <div
          className={classnames(styles.TutorialItem, styles.MyCasesItem)}
          style={{
            top: pos.MyCasesHeader.top,
            left: pos.MyCasesHeader.left,
          }}
        >
          {!isPhone && (
            <>
              <ArrowIcon />
              <br />
            </>
          )}
          Dit is een overzicht van uw lopende aanvragen of wijzigingen
          {isPhone && (
            <>
              <br />
              <ArrowIcon />
            </>
          )}
        </div>
        <div
          className={classnames(styles.TutorialItem, styles.MyAreaItem)}
          style={{
            top: pos.MyAreaHeader.top,
            left: pos.MyAreaHeader.left,
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
            top: pos.MyTipsHeader.top,
            left: pos.MyTipsHeader.left,
          }}
        >
          <ArrowIcon />
          <br />
          Hier geven wij u handige tips, bijvoorbeeld over de regelingen en
          voorzieningen van de gemeente
        </div>
      </div>,
      useModalRoot()
    )
  ) : (
    <></>
  );
}
