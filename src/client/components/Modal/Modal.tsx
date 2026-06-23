import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ActionGroup, Button, Dialog } from '@amsterdam/design-system-react';
import classnames from 'classnames';

import styles from './Modal.module.scss';
import { getElementOnPageAsync } from '../../helpers/utils.ts';
import { useKeyUp } from '../../hooks/useKey.ts';
import { MaLinkLikeButton } from '../MaLink/MaLink.tsx';

function FocusTrapInner() {
  const element = document.getElementById('modal-dialog');
  element?.focus();
  const elements = element?.querySelectorAll(
    'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])'
  );

  const focusableEls = elements
    ? Array.from(elements).filter(
        (element) => window.getComputedStyle(element)?.display !== 'none'
      )
    : [];

  const firstFocusableEl = focusableEls[0] as HTMLElement;
  const lastFocusableEl = focusableEls[focusableEls.length - 1] as HTMLElement;

  const handleTabKey = useCallback(
    (e: KeyboardEvent) => {
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
    },
    [firstFocusableEl, lastFocusableEl]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleTabKey);
    return () => {
      window.removeEventListener('keydown', handleTabKey);
    };
  }, [handleTabKey]);

  return null;
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
  }, [giveUpOnReadyPollingAfterMs, isReady, pollingQuerySelector]);

  return isReady ? <FocusTrapInner /> : null;
}

const GIVE_UP_READY_POLLING_AFTER_MS = 5000;

interface ModalProps {
  children: ReactNode;
  closeButtonLabel?: string;
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
  actions,
  children,
  closeButtonLabel,
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

  return (
    isOpen && (
      <>
        <div
          className={styles.Modal}
          onClick={() => (closeOnClickOutside ? onClose?.() : void 0)}
        />
        <Dialog
          ref={dialogRef}
          id="modal-dialog"
          onClose={() => onClose?.()}
          open
          heading={title ?? ''}
          closeButtonLabel={closeButtonLabel}
          footer={actions}
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
      </>
    )
  );
}

type ModalAction = {
  label: ReactNode;
  disabled?: boolean;
  buttonVariant?: 'primary' | 'secondary' | 'tertiary';
  onClick?: () => Promise<boolean | void>;
  doCloseModalOnClick?: boolean;
};

type ModalAndButtonProps = {
  buttonVariant?: 'primary' | 'secondary' | 'tertiary' | 'ma-link-like';
  modal: Prettify<
    Omit<ModalProps, 'isOpen' | 'children' | 'onClose' | 'actions'>
  >;
  children: ReactNode;
  buttonClassName?: string;
  buttonLabel: string;
  startOpen?: boolean;
  actions?: ModalAction[];
};

export function ModalAndButton({
  modal,
  children,
  buttonClassName,
  buttonVariant = 'secondary',
  buttonLabel = 'Open modal',
  startOpen = false,
  actions = [],
}: ModalAndButtonProps) {
  const [isLocationModalOpen, setLocationModalOpen] = useState(startOpen);
  const modalActionButtons = actions.length ? (
    <ActionGroup>
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.buttonVariant ?? 'primary'}
          disabled={action.disabled}
          onClick={async () => {
            const success = await action.onClick?.();
            const shouldClose =
              action.doCloseModalOnClick !== false &&
              (typeof success === 'boolean' ? success : true);
            if (shouldClose) {
              setLocationModalOpen(false);
            }
          }}
        >
          {action.label}
        </Button>
      ))}
    </ActionGroup>
  ) : undefined;
  return (
    <>
      {buttonVariant === 'ma-link-like' ? (
        <MaLinkLikeButton
          className={buttonClassName}
          onClick={() => setLocationModalOpen(true)}
        >
          {buttonLabel}
        </MaLinkLikeButton>
      ) : (
        <Button
          variant={buttonVariant}
          className={buttonClassName}
          onClick={() => setLocationModalOpen(true)}
        >
          {buttonLabel}
        </Button>
      )}
      <Modal
        {...modal}
        actions={modalActionButtons}
        isOpen={isLocationModalOpen}
        onClose={() => {
          setLocationModalOpen(false);
        }}
      >
        {children}
      </Modal>
    </>
  );
}
