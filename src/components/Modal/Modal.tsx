import { ComponentChildren } from 'App.types';
import classnames from 'classnames';
import React, { useRef, useEffect } from 'react';
import FocusTrap from 'focus-trap-react';
import ReactDOM from 'react-dom';
import { ReactComponent as CloseIcon } from 'assets/icons/Close.svg';

import styles from './Modal.module.scss';
import Heading from 'components/Heading/Heading';

interface ModalProps {
  children: ComponentChildren;
  className?: any;
  isOpen: boolean | undefined;
  onClose: () => void;
  title?: string;
  contentWidth?: number | 'boxed';
  contentVerticalPosition?: number | 'center' | 'top' | 'bottom';
  contentHorizontalPosition?: number | 'center' | 'left' | 'right';
  appendTo: HTMLElement;
}

function setScrollYProp() {
  document.documentElement.style.setProperty(
    '--scroll-y',
    `${window.scrollY}px`
  );
}

export default function Modal({
  children,
  className,
  isOpen = undefined,
  title,
  onClose,
  contentWidth = 'boxed',
  contentVerticalPosition = 'center',
  contentHorizontalPosition = 'center',
  appendTo,
}: ModalProps) {
  const dialogEl = useRef(null);

  useEffect(() => {
    if (isOpen === undefined) {
      return;
    }
    if (isOpen) {
      const scrollY = document.documentElement.style.getPropertyValue(
        '--scroll-y'
      );
      const body = document.body;
      body.style.top = `-${scrollY}`;
      body.classList.add('has-modal');
    } else {
      const body = document.body;
      const scrollY = body.style.top;
      body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    window.addEventListener('scroll', setScrollYProp);
    return () => {
      document.body.classList.remove('has-modal');
      window.removeEventListener('scroll', setScrollYProp);
    };
  }, [isOpen]);

  function closeFromOverlay(target: EventTarget) {
    const el = dialogEl.current ? (dialogEl.current! as HTMLElement) : null;
    if (el && !el.contains(target as Node)) {
      onClose();
    } else if (!el) {
      onClose();
    }
  }

  const inlineStyles: React.CSSProperties = {};

  if (typeof contentWidth === 'number') {
    inlineStyles.width = contentWidth;
  }
  if (typeof contentVerticalPosition === 'number') {
    inlineStyles.top = contentVerticalPosition;
  }
  if (typeof contentHorizontalPosition === 'number') {
    inlineStyles.left = contentHorizontalPosition;
  }

  return isOpen
    ? ReactDOM.createPortal(
        <>
          <div
            className={classnames(styles.Modal, className)}
            onClick={event => closeFromOverlay(event.target)}
          />
          <FocusTrap>
            <div
              role="dialog"
              aria-labelledby={title}
              aria-modal="true"
              className={classnames(
                styles.Dialog,
                contentWidth === 'boxed' && styles.Boxed,
                contentVerticalPosition === 'center' &&
                  styles.VerticallyCentered,
                contentHorizontalPosition === 'center' &&
                  styles.HorizontallyCentered,
                contentVerticalPosition === 'top' && styles.VerticallyTop,
                contentHorizontalPosition === 'left' && styles.HorizontallyLeft,
                contentVerticalPosition === 'bottom' && styles.VerticallyBottom,
                contentHorizontalPosition === 'right' &&
                  styles.HorizontallyRight
              )}
              ref={dialogEl}
              style={inlineStyles}
            >
              <header
                className={styles.Header}
                style={{
                  justifyContent: !!title ? 'space-between' : 'flex-end',
                }}
              >
                {!!title && <Heading size="small">{title}</Heading>}
                <button
                  className={styles.ButtonClose}
                  onClick={() => onClose()}
                >
                  <CloseIcon />
                </button>
              </header>
              <div className={styles.Content}>{children}</div>
            </div>
          </FocusTrap>
        </>,
        appendTo
      )
    : null;
}
