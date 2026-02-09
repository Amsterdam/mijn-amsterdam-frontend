import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import {
  Button,
  Dialog,
  Heading,
  IconButton,
} from '@amsterdam/design-system-react';
import { CloseIcon } from '@amsterdam/design-system-react-icons';
import classnames from 'classnames';

import styles from './Modal.module.scss';
import { getElementOnPageAsync } from '../../helpers/utils';
import { useMediumScreen } from '../../hooks/media.hook';
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isMediumScreen = useMediumScreen();

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
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

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
        {isMediumScreen ? (
          <Dialog
            ref={dialogRef}
            id="modal-dialog"
            onClose={() => onClose?.()}
            open
            heading={title ?? ''}
            footer={
              actions ?? (
                <Button variant="primary" onClick={() => onClose?.()}>
                  Sluiten
                </Button>
              )
            }
            className={classnames(
              styles.Dialog,
              !showCloseButton && styles.DialogWithoutCloseButton,
              className
            )}
          >
            {children}
            {pollingQuerySelector && (
              <FocusTrap
                pollingQuerySelector={pollingQuerySelector}
                giveUpOnReadyPollingAfterMs={giveUpOnReadyPollingAfterMs}
              />
            )}
          </Dialog>
        ) : (
          <div
            id="modal-dialog"
            className={classnames(styles.CustomDialog, className)}
          >
            <div className={styles.CustomDialogHeader}>
              {title ? <Heading level={3}>{title}</Heading> : <i></i>}
              {showCloseButton && (
                <IconButton
                  name="Overlay sluiten"
                  label="Overlay sluiten"
                  svg={CloseIcon}
                  onClick={() => onClose?.()}
                />
              )}
            </div>

            <div className={styles.CustomDialogContent}>{children}</div>

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
        )}
      </div>
    )
  );
}
