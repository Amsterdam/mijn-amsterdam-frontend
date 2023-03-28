import classNames from 'classnames';
import { ReactNode, useEffect, useRef, useState } from 'react';
import styles from './TextClamp.module.scss';

interface TextClampProps {
  children: ReactNode;
  tagName?: keyof JSX.IntrinsicElements;
  maxHeight?: `${number}px`;
  startClamped?: boolean;
}

export function TextClamp({
  children,
  tagName = 'div',
  maxHeight = '45px',
  startClamped = true,
}: TextClampProps) {
  const WrapperEL = tagName;
  const contentRef = useRef<HTMLElement>(null);
  const [isClamped, setIsClamped] = useState<boolean>(startClamped);
  const [hasOverflow, setHasOverflow] = useState(true);

  useEffect(() => {
    if (
      contentRef.current &&
      contentRef.current.getBoundingClientRect().height >
        parseInt(maxHeight, 10)
    ) {
      setHasOverflow(true);
    }
  }, [maxHeight]);

  const toggleClamp = () => {
    setIsClamped((isClamped) => !isClamped);
  };

  if (!hasOverflow) {
    return <>{children}</>;
  }

  return (
    <WrapperEL
      className={classNames(styles.TextClamp, isClamped && styles.isClamped)}
      onClick={() => toggleClamp()}
      style={{ ['--maxHeight' as string]: maxHeight }}
    >
      {children}
    </WrapperEL>
  );
}
