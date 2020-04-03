import React, { useContext } from 'react';

import { AppContext } from '../../AppState';
import { Button } from '../Button/Button';
import Modal from '../Modal/Modal';
import styles from './MyTips.module.scss';

interface OptInOutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MyTipsOptInOutModal({
  isOpen,
  onClose,
}: OptInOutModalProps) {
  const {
    TIPS: { isOptIn, optIn, optOut },
  } = useContext(AppContext);

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
              U ziet nu algemene tips over voorzieningen en activiteiten in
              Amsterdam. Op basis van uw informatie die bij de gemeente bekend
              is kunnen we u ook informatie tonen die beter bij uw persoonlijk
              situatie past.
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
              } else {
                optIn();
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
