import { ReactNode, useRef } from 'react';

import { Dialog } from '@amsterdam/design-system-react';
import classnames from 'classnames';

import styles from './Modal.module.scss';

interface ModalProps {
  children: ReactNode;
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

  return isOpen ? (
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
    </div>
  ) : null;
}
