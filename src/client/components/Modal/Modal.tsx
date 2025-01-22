import { ReactNode, useRef } from 'react';

import { Dialog } from '@amsterdam/design-system-react';
import classnames from 'classnames';
import ReactDOM from 'react-dom';

import styles from './Modal.module.scss';
import { ComponentChildren } from '../../../universal/types';
import { useModalRoot } from '../../hooks/modalRoot.hook';

interface ModalProps {
  children: ComponentChildren;
  closeButtonLabel?: string;
  actions?: ReactNode;
  className?: string;
  isOpen: boolean | undefined;
  onClose?: () => void;
  title?: string;
  showCloseButton?: boolean;
}

export function Modal({
  actions,
  children,
  closeButtonLabel,
  className,
  isOpen = undefined,
  title,
  showCloseButton = true,
  onClose,
}: ModalProps) {
  const dialogEl = useRef(null);
  const marginTop = window.scrollY;
  const appendToElement = useModalRoot(document.getElementById('modal-root')!);

  return isOpen
    ? ReactDOM.createPortal(
        <div className={styles.ModalContainer}>
          <div className={styles.Modal} onClick={onClose} />

          <Dialog
            ref={dialogEl}
            onClose={onClose}
            open
            heading={title ?? ''}
            closeButtonLabel={closeButtonLabel}
            footer={actions}
            style={{ transform: `translateY(${marginTop}px)` }}
            className={classnames(
              styles.Dialog,
              !showCloseButton && styles.DialogWithoutCloseButton,
              className
            )}
          >
            {children}
          </Dialog>
        </div>,
        appendToElement
      )
    : null;
}
