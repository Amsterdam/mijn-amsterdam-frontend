import { CSSProperties, useEffect, useRef } from 'react';

import { Dialog as DialogComp } from '@amsterdam/design-system-react';
import classnames from 'classnames';
import FocusTrap from 'focus-trap-react';
import ReactDOM from 'react-dom';
import { ComponentChildren } from '../../../universal/types';
import { useModalRoot } from '../../hooks';
import styles from './Modal.module.scss';

interface ModalProps {
  children: ComponentChildren;
  actions?: JSX.Element;
  className?: string;
  isOpen: boolean | undefined;
  onClose?: () => void;
  title?: string;
  showCloseButton?: boolean;
  contentWidth?: number | string | 'boxed';
  contentVerticalPosition?: number | 'center' | 'top' | 'bottom';
  contentHorizontalPosition?: number | 'center' | 'left' | 'right';
  appendTo?: HTMLElement;
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
  actions,
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
  const appendToElement = useModalRoot(appendTo);

  // Concepts taken from: https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/
  useEffect(() => {
    if (isOpen === undefined) {
      return;
    }

    if (isOpen) {
      const scrollY = window.scrollY || window.pageYOffset;
      const body = document.body;
      body.style.top = `-${scrollY}px`;
      body.classList.add('has-modal');
    } else {
      const body = document.body;
      const scrollY = body.style.top;
      body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    return () => {
      document.body.classList.remove('has-modal');
    };
  }, [isOpen]);

  const inlineStyles: CSSProperties = {};

  if (contentWidth !== 'boxed') {
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
        <FocusTrap
          focusTrapOptions={{
            escapeDeactivates: false,
            // Prevents testing fails. https://github.com/focus-trap/tabbable#display-check
            tabbableOptions: { displayCheck: 'none' },
          }}
        >
          <div className={styles.ModalContainer}>
            <div
              className={classnames(styles.Modal, className)}
              onClick={() => typeof onClose === 'function' && onClose()}
            />

            <DialogComp
              className={classnames(
                styles.Dialog,
                contentWidth === 'boxed' && styles.Boxed,
                contentVerticalPosition === 'center' &&
                  styles.VerticallyCentered,
                contentHorizontalPosition === 'center' &&
                  styles.HorizontallyCentered,
                contentVerticalPosition === 'top' && styles.VerticallyTop,
                contentHorizontalPosition === 'left' && styles.HorizontallyLeft,
                styles.VerticallyBottom,
                contentHorizontalPosition === 'right' &&
                  styles.HorizontallyRight
              )}
              ref={dialogEl}
              style={inlineStyles}
              actions={<>{actions}</>}
              onClose={() => typeof onClose === 'function' && onClose()}
              open
              title={title}
            >
              {children}
            </DialogComp>
          </div>
        </FocusTrap>,
        appendToElement
      )
    : null;
}
