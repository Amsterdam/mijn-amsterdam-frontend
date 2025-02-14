import React, { ReactNode, useCallback, useState } from 'react';

import classNames from 'classnames';

import styles from './TextClamp.module.scss';

// The difference between maxHeight and actualHeight should be at least this number in pixels
const TEXT_CLAMP_HEIGHT_DELTA_THRESHOLD = 10;

type CustomProp = { [key in `--${string}`]: string };

export type TextClampCSSProperties = CustomProp;

interface TextClampProps {
  children: ReactNode;
  tagName?: keyof JSX.IntrinsicElements;
  maxHeight?: `${number}px`;
  minHeight?: `${number}px`;
  startClamped?: boolean;
  style?: TextClampCSSProperties | null;
}

export function TextClamp({
  children,
  tagName = 'div',
  maxHeight = '45px',
  minHeight = '35px',
  startClamped = true,
  style = null,
}: TextClampProps) {
  const WrapperEL = tagName;
  const [isClamped, setIsClamped] = useState<boolean>(startClamped);
  const [hasOverflow, setHasOverflow] = useState<boolean | undefined>(
    undefined
  );

  const callBackRef = useCallback((domNode: HTMLElement) => {
    if (typeof hasOverflow === 'boolean' || !domNode) {
      return;
    }
    setHasOverflow(
      domNode.getBoundingClientRect().height - parseInt(maxHeight, 10) >
        TEXT_CLAMP_HEIGHT_DELTA_THRESHOLD
    );
  }, []);

  const toggleClamp = () => {
    setIsClamped((isClamped) => !isClamped);
  };

  if (hasOverflow === false) {
    return <>{children}</>;
  }

  return (
    <WrapperEL
      className={classNames(
        styles.TextClamp,
        hasOverflow && isClamped && styles.isClamped,
        hasOverflow && styles.hasOverflow
      )}
      style={{
        ...style,
        ['--maxHeight' as string]: maxHeight,
        ['--minHeight' as string]: minHeight,
      }}
    >
      <span ref={callBackRef} className={styles.textWrap}>
        {children}
      </span>
      {hasOverflow && (
        <button
          onClick={() => toggleClamp()}
          className={classNames(
            styles.ReadMoreButton,
            isClamped && styles.isClamped
          )}
        >
          <span className={styles.label}>
            Toon {isClamped ? 'alle tekst' : 'minder'}
          </span>
        </button>
      )}
    </WrapperEL>
  );
}
