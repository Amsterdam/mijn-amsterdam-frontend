import React, { useEffect, useState } from 'react';
import styles from './FontEnlarger.module.scss';
import { ComponentChildren } from 'App.types';
import classnames from 'classnames';

export interface ComponentProps {
  children?: ComponentChildren;
}

export default function FontEnlarger({ children }: ComponentProps) {
  const [isVisible, setVisibility] = useState(false);
  function show() {
    setVisibility(true);
  }
  function hide() {
    setVisibility(false);
  }
  return (
    <div className={styles.FontEnlarger}>
      <strong onMouseEnter={() => show()} onMouseLeave={() => hide()}>
        A + -
      </strong>
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
