import React from 'react';
import ReactDOM from 'react-dom';
import styles from './Tutorial.module.scss';

import { ReactComponent as ArrowIcon } from 'assets/icons/Arrow__primary-white.svg';
import useModalRoot from 'hooks/modalRoot.hook';
import classnames from 'classnames';
import useDetectResizing from 'hooks/detectResize.hook';
import { usePhoneScreen } from '../../hooks/media.hook';

function TutorialItem({ el }: { el: any }) {
  const heading = el.querySelector('[class^="Heading_Heading"]') || el;
  const pos = heading.getBoundingClientRect();
  const styledElement = window.getComputedStyle(heading, null);
  const fontSize = styledElement.getPropertyValue('font-size');
  const lineHeight = styledElement.getPropertyValue('line-height');
  const padding = styledElement.getPropertyValue('padding');
  const [text, fromDirection = 'right-top'] = el.dataset.tutorialItem.split(
    ';'
  );

  return (
    <div
      className={classnames(styles.TutorialItem, styles[fromDirection])}
      style={{ left: pos.left, top: pos.top + window.pageYOffset }}
    >
      <h3
        className={styles.TutorialItemHeading}
        style={{ fontSize, lineHeight, padding }}
      >
        {heading.textContent}
      </h3>
      <div className={styles.TutorialItemInner}>
        <p className={styles.TutorialText}>{text}</p>
        <span className={styles.ArrowIconContainer}>
          <ArrowIcon className={styles.ArrowIcon} />
        </span>
      </div>
    </div>
  );
}

export default function Tutorial() {
  const tutorialItems = Array.from(
    document.querySelectorAll('[data-tutorial-item]')
  );

  const isResizing = useDetectResizing();
  const isPhoneScreen = usePhoneScreen();

  // Check if positions are calculated
  return ReactDOM.createPortal(
    <div
      className={classnames(
        styles.Tutorial,
        isResizing && !isPhoneScreen && styles.TutorialResizing
      )}
      style={{ height: document.body.clientHeight }}
    >
      {tutorialItems.map((el, i) => (
        <TutorialItem key={i} el={el} />
      ))}
    </div>,
    useModalRoot()
  );
}
