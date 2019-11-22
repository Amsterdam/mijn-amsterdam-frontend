import React, { useState, useRef } from 'react';
import styles from './FontEnlarger.module.scss';
import { ComponentChildren } from 'App.types';
import classnames from 'classnames';

export interface ComponentProps {
  children?: ComponentChildren;
}

export default function FontEnlarger({ children }: ComponentProps) {
  const [isVisible, setVisibility] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  function show() {
    setVisibility(true);
  }
  function hide() {
    setVisibility(false);
  }
  function focus() {
    return buttonRef.current!.focus();
  }

  return (
    <div className={styles.FontEnlarger}>
      <button
        ref={buttonRef}
        aria-label="Uitleg tekst vergroten"
        onFocus={() => show()}
        onBlur={() => hide()}
        onClick={() => focus()}
        aria-expanded={isVisible}
      >
        A &#43; &minus;
      </button>
      <div
        className={classnames(
          styles.FontEnlargerPopup,
          isVisible && styles.isVisible
        )}
      >
        <p>
          Om de pagina makkelijker te lezen kunt u de pagina vergroten, door in
          Windows Control met + toets in te drukken (op Mac is het Command met
          +).
        </p>
      </div>
    </div>
  );
}
