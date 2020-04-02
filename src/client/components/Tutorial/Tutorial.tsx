import React, { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';

import { ReactComponent as ArrowIcon } from '../../assets/icons/Arrow__primary-white.svg';
import { CloseButton } from '../Button/Button';
import FocusTrap from 'focus-trap-react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import styles from './Tutorial.module.scss';
import useDetectResizing from '../../hooks/detectResize.hook';
import useModalRoot from '../../hooks/modalRoot.hook';
import { usePhoneScreen } from '../../hooks/media.hook';

interface TutorialProps {
  onClose: () => void;
}

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

  const ref = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const [itemPos, setItemPos] = useState({ width: 0, left: 0 });
  const [headingPos, setHeadingPos] = useState({ width: 0, left: 0 });

  useEffect(() => {
    if (headingRef.current !== null) {
      setHeadingPos((headingRef.current as any).getBoundingClientRect());
    }
    if (ref.current !== null) {
      setItemPos((ref.current as any).getBoundingClientRect());
    }
  }, [ref, headingRef]);

  const itemWidth = (itemPos as any).width;
  const headingWidth = (headingPos as any).width + pos.left;
  const left =
    fromDirection.startsWith('right') &&
    headingWidth + itemWidth > window.innerWidth
      ? headingWidth + itemWidth - window.innerWidth
      : 0;
  const textStyle: CSSProperties = {
    transform: `translateX(-${left}px)`,
  };

  return (
    <div
      className={classnames(styles.TutorialItem, styles[fromDirection])}
      style={{
        left: pos.left,
        top: pos.top + window.pageYOffset,
      }}
    >
      <h3
        ref={headingRef}
        className={styles.TutorialItemHeading}
        style={{ fontSize, lineHeight, padding }}
      >
        {heading.textContent}
      </h3>
      <div className={styles.TutorialItemInner}>
        <p className={styles.TutorialText} style={textStyle}>
          <span ref={ref}>{text}</span>
        </p>
        <span aria-hidden="true" className={styles.ArrowIconContainer}>
          <ArrowIcon className={styles.ArrowIcon} />
        </span>
      </div>
    </div>
  );
}

export default function Tutorial({ onClose }: TutorialProps) {
  const tutorialItems = Array.from(
    document.querySelectorAll('[data-tutorial-item]')
  );

  const isResizing = useDetectResizing();
  const isPhoneScreen = usePhoneScreen();

  // Check if positions are calculated
  return ReactDOM.createPortal(
    <FocusTrap focusTrapOptions={{ escapeDeactivates: false }}>
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
        <CloseButton
          title="Uitleg verbergen"
          onClick={onClose}
          className={styles.CloseTutorial}
        />
      </div>
    </FocusTrap>,
    useModalRoot()
  );
}
