import { ComponentChildren } from 'App.types';
import classnames from 'classnames';
import React, { useRef, DOMElement } from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom';

import styles from './Modal.module.scss';
import Heading from 'components/Heading/Heading';

interface ModalProps {
  children: ComponentChildren;
  className?: any;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  contentWidth?: number | 'boxed';
  contentVerticalPosition?: number | 'center';
  contentHorizontalPosition?: number | 'center';
}

export default function Modal({
  children,
  className,
  isOpen = false,
  title,
  onClose,
  contentWidth = 'boxed',
  contentVerticalPosition = 'center',
  contentHorizontalPosition = 'center',
}: ModalProps) {
  const modalWrapperEl = useRef(null);

  function closeFromOverlay(target: EventTarget) {
    if (!(modalWrapperEl.current! as HTMLElement).contains(target as Node)) {
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
        <div
          className={classnames(styles.Modal, className)}
          onClick={event => closeFromOverlay(event.target)}
        >
          <div
            className={classnames(
              styles.Wrapper,
              contentWidth === 'boxed' && styles.Boxed,
              contentVerticalPosition === 'center' && styles.VerticallyCentered,
              contentHorizontalPosition === 'center' &&
                styles.HorizontallyCentered
            )}
            ref={modalWrapperEl}
            style={inlineStyles}
          >
            <header
              className={styles.Header}
              style={{ justifyContent: !!title ? 'space-between' : 'flex-end' }}
            >
              {!!title && <Heading size="small">{title}</Heading>}
              <button className={styles.ButtonClose} onClick={onClose}>
                <span>&times;</span>
              </button>
            </header>
            <div className={styles.Content}>{children}</div>
          </div>
        </div>,
        document.getElementById('modal-root')!
      )
    : null;
}
