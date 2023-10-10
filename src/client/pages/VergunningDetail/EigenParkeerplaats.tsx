import type { EigenParkeerplaats as EigenParkeerplaatsType } from '../../../server/services';
import { defaultDateFormat } from '../../../universal/helpers';
import InfoDetail from '../../components/InfoDetail/InfoDetail';
import { Location } from './Location';

function getVerzoekType(vergunning: EigenParkeerplaatsType) {
  switch (true) {
    case vergunning.isNewRequest:
      return 'Nieuwe aanvraag';
    case vergunning.isCarsharingpermit:
      return 'Autodeelbedrijf';
    case vergunning.isLicensePlateChange:
      return 'Kentekenwijziging';
    case vergunning.isRelocation:
      return 'Verhuizing';
    case vergunning.isExtension:
      return 'Verlenging';
  }
}

export function EigenParkeerplaats({
  vergunning,
}: {
  vergunning: EigenParkeerplaatsType;
}) {
  const isVerleend = vergunning.processed && vergunning.decision === 'Verleend';
  const isAfgehandeld = vergunning.processed;

  return (
    <>
      <InfoDetail label="Kenmerk" value={vergunning.identifier || '-'} />
      <InfoDetail label="Verzoek" value={getVerzoekType(vergunning)} />

      <Location
        label="Adres"
        location={`${vergunning.streetLocation1} ${vergunning.housenumberLocation1}`}
      />
      <InfoDetail label="Soortplek" value={vergunning.locationkindLocation1} />
      <InfoDetail label="Parkeervak" value={vergunning.urlLocation1} />

      {vergunning.streetLocation2 && (
        <Location
          label="Adres"
          location={`${vergunning.streetLocation2} ${vergunning.housenumberLocation2}`}
        />
      )}
      {vergunning.streetLocation2 && (
        <InfoDetail
          label="Soortplek"
          value={vergunning.locationkindLocation2}
        />
      )}
      {vergunning.streetLocation2 && (
        <InfoDetail label="Parkeervak" value={vergunning.urlLocation2} />
      )}

      <InfoDetail label="Kenteken(s)" value={vergunning.licensePlates} />
      {vergunning.isLicensePlateChange && (
        <InfoDetail
          label="Oude kenteken(s)"
          value={vergunning.previousLicensePlates}
        />
      )}
      {isVerleend && vergunning.dateStart && (
        <InfoDetail
          label="Startdatum"
          value={defaultDateFormat(vergunning.dateStart)}
        />
      )}
      {isVerleend && vergunning.dateEnd && (
        <InfoDetail
          label="Vervaldatum"
          value={defaultDateFormat(vergunning.dateEnd)}
        />
      )}
      {isAfgehandeld && (
        <InfoDetail label="Resultaat" value={vergunning.decision} />
      )}
    </>
  );
}
