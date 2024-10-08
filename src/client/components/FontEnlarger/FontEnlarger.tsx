import { useRef, useState } from 'react';

import styles from './FontEnlarger.module.scss';
import { ComponentChildren } from '../../../universal/types';

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
        onFocus={() => show()}
        onBlur={() => hide()}
        onClick={() => focus()}
        onKeyUp={(event) => {
          event.key.toLowerCase() === 'escape' && hide();
        }}
        aria-label="Uitleg tekst vergroten"
        aria-labelledby="show-font-enlarger-info"
        aria-expanded={isVisible}
      >
        A &#43; &minus;
      </button>
      <p
        id="show-font-enlarger-info"
        hidden={!isVisible}
        className={styles.FontEnlargerPopup}
      >
        Om de pagina makkelijker te lezen kunt u de pagina vergroten, door in
        Windows Control met + toets in te drukken (op Mac is het Command met +).
      </p>
    </div>
  );
}
