import { InfoDetail } from '../../../components';
import {
  LocationModalProps,
  LocationModal,
} from '../../../components/LocationModal/LocationModal';

interface LocationProps extends Omit<LocationModalProps, 'address'> {
  // Text content above the "Modal open" link
  text?: string;
  // An address
  location: LocationModalProps['address'];
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
            address={location}
          />
        </>
      }
    />
  );
}
