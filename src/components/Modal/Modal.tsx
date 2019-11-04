import { ComponentChildren } from 'App.types';
import classnames from 'classnames';
import React, { useRef, useEffect } from 'react';
import FocusTrap from 'focus-trap-react';
import ReactDOM from 'react-dom';
import { ReactComponent as CloseIcon } from 'assets/icons/Close.svg';

import styles from './Modal.module.scss';
import Heading from 'components/Heading/Heading';
import useModalRoot from 'hooks/modalRoot.hook';
import { CloseButton } from '../Button/Button';

interface ModalProps {
  children: ComponentChildren;
  className?: any;
  isOpen: boolean | undefined;
  onClose?: () => void;
  title?: string;
  showCloseButton?: boolean;
  contentWidth?: number | 'boxed';
  contentVerticalPosition?: number | 'center' | 'top' | 'bottom';
  contentHorizontalPosition?: number | 'center' | 'left' | 'right';
  appendTo?: HTMLElement;
}

function setScrollYProp() {
  document.documentElement.style.setProperty(
    '--scroll-y',
    `${window.scrollY}px`
  );
}

export default function Modal({
  children,
  ...props
}: Omit<ModalProps, 'appendTo'>) {
  return (
    <Dialog {...props} appendTo={document.getElementById('modal-root')!}>
      {children}
    </Dialog>
  );
}

export function Dialog({
  children,
  className,
  isOpen = undefined,
  title,
  showCloseButton = true,
  onClose,
  contentWidth = 'boxed',
  contentVerticalPosition = 'center',
  contentHorizontalPosition = 'center',
  appendTo,
}: ModalProps) {
  const dialogEl = useRef(null);

  if (!appendTo) {
    appendTo = useModalRoot();
  }

  // Concepts taken from: https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/
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

  const inlineStyles: React.CSSProperties = {};

  if (typeof contentWidth === 'number') {
    inlineStyles.width = '100%';
    inlineStyles.maxWidth = contentWidth;
  }
  if (typeof contentVerticalPosition === 'number') {
    inlineStyles.top = contentVerticalPosition;
  }
  if (typeof contentHorizontalPosition === 'number') {
    inlineStyles.left = contentHorizontalPosition;
  }

  return isOpen
    ? ReactDOM.createPortal(
        <FocusTrap focusTrapOptions={{ escapeDeactivates: false }}>
          <div className={styles.ModalContainer}>
            <div
              className={classnames(styles.Modal, className)}
              onClick={() => typeof onClose === 'function' && onClose()}
            />

            <div
              role="dialog"
              aria-labelledby="dialog-title"
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
                id="dialog-title"
                className={styles.Header}
                style={{
                  justifyContent: !!title ? 'space-between' : 'flex-end',
                }}
              >
                {!!title && <Heading size="small">{title}</Heading>}
                {showCloseButton && (
                  <CloseButton
                    title="Overlay sluiten"
                    className="ButtonClose"
                    onClick={() => typeof onClose === 'function' && onClose()}
                  />
                )}
              </header>
              <div className={styles.Content}>{children}</div>
            </div>
          </div>
        </FocusTrap>,
        appendTo
      )
    : null;
}
