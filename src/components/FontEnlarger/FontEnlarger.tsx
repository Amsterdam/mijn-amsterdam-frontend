import React, { useEffect, useState } from 'react';
import styles from './FontEnlarger.module.scss';
import { ComponentChildren } from 'App.types';
import classnames from 'classnames';
import { useDebouncedCallback } from 'use-debounce';

export interface ComponentProps {
  children?: ComponentChildren;
}

export default function FontEnlarger({ children }: ComponentProps) {
  const [isVisible, setVisibility] = useState(false);
  function show() {
    setVisibility(true);
  }
  const [hide] = useDebouncedCallback(
    () => {
      setVisibility(false);
    },
    200,
    []
  );
  return (
    <div className={styles.FontEnlarger}>
      <button
        onFocus={() => show()}
        onBlur={() => hide()}
        onMouseEnter={() => show()}
        onMouseLeave={() => hide()}
        title="Uitleg tekst vergroter"
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
