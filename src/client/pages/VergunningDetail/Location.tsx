import { InfoDetail } from '../../components';
import {
  LocationModal,
  LocationModalProps,
} from '../../components/LocationModal/LocationModal';
import styles from './VergunningDetail.module.scss';

interface LocationProps extends LocationModalProps {
  // Text content above the "Modal open" link
  text?: string;
}

export function Location({
  location = null,
  latlng,
  modalTitle,
  text,
  label,
  trackPageViewUrl,
  trackPageViewTitle,
}: LocationProps) {
  return (
    <InfoDetail
      className={styles.LocationInfo}
      label={label ?? 'Locatie'}
      value={
        <>
          {!!text && <>{text}</>}
          {!text && !!location && <>{location}</>}
          <br />
          <LocationModal
            latlng={latlng}
            modalTitle={modalTitle}
            trackPageViewTitle={trackPageViewTitle}
            trackPageViewUrl={trackPageViewUrl}
            location={location}
          />
        </>
      }
    />
  );
}
