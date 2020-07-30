import React, { useContext } from 'react';

import { Button } from '../Button/Button';
import Modal from '../Modal/Modal';
import { OptInContext } from '../OptInContext/OptInContext';
import styles from './MyTips.module.scss';

interface OptInOutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MyTipsOptInOutModal({
  isOpen,
  onClose,
}: OptInOutModalProps) {
  const optInState = useContext(OptInContext);
  const { isOptIn, optIn, optOut } = optInState;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Persoonlijke tips"
      contentWidth={620}
    >
      <>
        <p className={styles.OptInOutInfo}>
          {!isOptIn ? (
            <>
              U ziet nu algemene tips. Wij kunnen u ook tips tonen die beter bij
              uw persoonlijke situatie passen. Wij maken dan gebruik van de
              gegevens die wij van u hebben.
            </>
          ) : (
            <>
              U ziet nu persoonlijke tips over voorzieningen en activiteiten in
              Amsterdam. We kunnen u ook algemene informatie tonen waarbij geen
              gebruik gemaakt wordt van persoonlijke informatie.
            </>
          )}
        </p>
        <p className={styles.OptInOutButtons}>
          <Button
            className={styles.OptInOutConfirmButton}
            variant={isOptIn ? 'secondary-inverted' : 'secondary'}
            onClick={() => {
              if (isOptIn) {
                optOut();
                // controller.TIPS?.fetch(false);
              } else {
                optIn();
                // controller.TIPS?.fetch(true);
              }
              onClose();
            }}
          >
            {isOptIn
              ? 'Nee, toon geen persoonlijke tips'
              : 'Ja, toon persoonlijke tips'}
          </Button>
        </p>
      </>
    </Modal>
  );
}
