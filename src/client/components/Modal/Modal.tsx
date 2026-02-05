import { ReactNode, useCallback, useEffect, useState } from 'react';

import { Button, Heading, IconButton } from '@amsterdam/design-system-react';
import { CloseIcon } from '@amsterdam/design-system-react-icons';
import classnames from 'classnames';

import styles from './Modal.module.scss';
import { getElementOnPageAsync } from '../../helpers/utils';
import { useKeyUp } from '../../hooks/useKey';

function FocusTrapInner() {
  const element = document.getElementById('modal-dialog');
  element?.focus();
  const elements = element?.querySelectorAll(
    'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])'
  );

  if (!element || !elements) {
    return null;
  }

  const focusableEls = Array.from(elements).filter(
    (element) => window.getComputedStyle(element)?.display !== 'none'
  );

  const firstFocusableEl = focusableEls[0] as HTMLElement;
  const lastFocusableEl = focusableEls[focusableEls.length - 1] as HTMLElement;

  function handleTabKey(e: KeyboardEvent) {
    const isTabPressed = e.key === 'Tab';

    if (!isTabPressed) {
      return;
    }

    if (e.shiftKey) {
      /* shift + tab */
      if (document.activeElement === firstFocusableEl) {
        lastFocusableEl.focus();
        e.preventDefault();
      }
      /* tab */
    } else if (document.activeElement === lastFocusableEl) {
      firstFocusableEl.focus();
      e.preventDefault();
    }
  }

  window.addEventListener('keydown', handleTabKey);

  useEffect(() => {
    return () => {
      window.removeEventListener('keydown', handleTabKey);
    };
  }, []);
}

function FocusTrap({
  pollingQuerySelector,
  giveUpOnReadyPollingAfterMs,
}: {
  pollingQuerySelector: string;
  giveUpOnReadyPollingAfterMs: number;
}) {
  const [isReady, setIsReady] = useState(pollingQuerySelector ? false : true);

  useEffect(() => {
    if (!isReady && pollingQuerySelector) {
      // Delays the initialization of the focus trap. This is necessary because some dialog content is not yet rendered when the dialog is opened.
      getElementOnPageAsync(
        pollingQuerySelector,
        giveUpOnReadyPollingAfterMs
      ).then(() => {
        setIsReady(true);
      });
    }
  }, []);

  return isReady ? <FocusTrapInner /> : null;
}

const GIVE_UP_READY_POLLING_AFTER_MS = 5000;

interface ModalProps {
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  isOpen: boolean | undefined;
  onClose?: () => void;
  title?: string;
  showCloseButton?: boolean;
  closeOnEscape?: boolean;
  closeOnClickOutside?: boolean;
  pollingQuerySelector?: string;
  giveUpOnReadyPollingAfterMs?: number;
}

export function Modal({
  children,
  actions,
  className,
  isOpen = undefined,
  title,
  showCloseButton = true,
  onClose,
  closeOnEscape = true,
  closeOnClickOutside = true,
  pollingQuerySelector,
  giveUpOnReadyPollingAfterMs = GIVE_UP_READY_POLLING_AFTER_MS,
}: ModalProps) {
  const keyHandler = useCallback(
    (event: KeyboardEvent) => {
      if (!closeOnEscape) {
        return;
      }
      const isEscape = event.key === 'Escape';
      if (isEscape) {
        onClose?.();
      }
    },
    [onClose, closeOnEscape]
  );

  useKeyUp(keyHandler);

  useEffect(() => {
    console.log('Modal useEffect isOpen', isOpen);
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Disable scrolling
    } else {
      document.body.style.overflow = ''; // Reset to default
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    isOpen && (
      <div className={styles.ModalContainer}>
        <div
          className={styles.Modal}
          onClick={() => (closeOnClickOutside ? onClose?.() : void 0)}
        />
        <div id="modal-dialog" className={classnames(styles.Dialog, className)}>
          <div className={styles.DialogHeader}>
            {title ? <Heading level={3}>{title}</Heading> : <i></i>}
            {showCloseButton && (
              <IconButton
                label="Sluiten"
                svg={CloseIcon}
                onClick={() => onClose?.()}
              />
            )}
          </div>

          <div className={styles.DialogContent}>{children}</div>

          {pollingQuerySelector && (
            <FocusTrap
              pollingQuerySelector={pollingQuerySelector}
              giveUpOnReadyPollingAfterMs={giveUpOnReadyPollingAfterMs}
            />
          )}

          {actions ?? (
            <Button variant="primary" onClick={() => onClose?.()}>
              Sluiten
            </Button>
          )}
        </div>
      </div>
    )
  );
}
