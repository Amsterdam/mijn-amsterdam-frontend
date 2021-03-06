import classnames from 'classnames';
import { ReactNode, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { KVKSourceDataContent } from '../../../server/services/kvk';
import { AppRoutes, FeatureToggle } from '../../../universal/config';
import { getFullName } from '../../../universal/helpers';
import { BRPData } from '../../../universal/types';
import { IconHomeCommercial, IconProfile } from '../../assets/icons';
import { useProfileType } from '../../hooks/useProfileType';
import { Button } from '../Button/Button';
import LoadingContent from '../LoadingContent/LoadingContent';
import styles from './ProfileName.module.scss';

interface CommercialProfileNameProps {
  company?: KVKSourceDataContent;
  onClick?: (event: any) => void;
  isActive: boolean;
  tutorial: string;
}

function CommercialProfileName({
  company,
  onClick,
  isActive,
  tutorial,
}: CommercialProfileNameProps) {
  const label = company?.onderneming.handelsnaam || 'Mijn onderneming';
  return (
    <Button
      onClick={onClick}
      icon={IconHomeCommercial}
      variant="plain"
      lean={true}
      className={classnames(
        styles.ProfileLink,
        styles['ProfileLink--commercial'],
        isActive && styles['ProfileLink--active']
      )}
    >
      <span data-tutorial-item={tutorial ? tutorial + ';' + label : ''}>
        {label}
      </span>
    </Button>
  );
}

interface PrivateProfileNameProps {
  person?: BRPData['persoon'];
  onClick?: (event: any) => void;
  isActive: boolean;
  tutorial: string;
}

function PrivateProfileName({
  person,
  onClick,
  isActive,
  tutorial,
}: PrivateProfileNameProps) {
  const label = person?.opgemaakteNaam ? getFullName(person) : 'Mijn gegevens';
  return (
    <Button
      onClick={onClick}
      icon={IconProfile}
      variant="plain"
      lean={true}
      className={classnames(
        styles.ProfileLink,
        styles['ProfileLink--private'],
        isActive && styles['ProfileLink--active']
      )}
    >
      <span data-tutorial-item={tutorial ? tutorial + ';' + label : ''}>
        {label}
      </span>
    </Button>
  );
}

interface PrivateCommercialProfileToggleProps {
  person?: BRPData['persoon'];
  company?: KVKSourceDataContent;
}

function PrivateCommercialProfileToggle({
  person,
  company,
}: PrivateCommercialProfileToggleProps) {
  const [profileType, setProfileType] = useProfileType();

  return (
    <>
      <PrivateProfileName
        person={person}
        isActive={profileType === 'private'}
        tutorial={
          profileType === 'private-commercial'
            ? 'Hier schakelt u naar uw persoonlijke profiel;left-bottom'
            : ''
        }
        onClick={() => setProfileType('private')}
      />
      <CommercialProfileName
        company={company}
        isActive={profileType === 'private-commercial'}
        tutorial={
          profileType === 'private'
            ? 'Hier schakelt u naar uw zakelijke profiel;left-bottom'
            : ''
        }
        onClick={() => setProfileType('private-commercial')}
      />
    </>
  );
}

interface ProfileNameProps {
  person?: BRPData['persoon'] | null;
  company?: KVKSourceDataContent | null;
  profileType: ProfileType;
}

export function ProfileName({
  person,
  company,
  profileType,
}: ProfileNameProps) {
  const history = useHistory();
  const nameContent = useMemo(() => {
    let nameContent: undefined | string | ReactNode;

    switch (true) {
      case (!!person && !company) ||
        (!FeatureToggle.profileToggleActive && !!person):
        nameContent = (
          <PrivateProfileName
            person={person!}
            isActive={false}
            tutorial={
              'Hier ziet u uw persoonsgegevens, zoals uw adres en geboortedatum;left-bottom'
            }
            onClick={() => history.push(AppRoutes.BRP)}
          />
        );
        break;
      case FeatureToggle.kvkActive &&
        FeatureToggle.profileToggleActive &&
        !!person &&
        !!company:
        nameContent = <PrivateCommercialProfileToggle person={person!} />;
        break;
      case FeatureToggle.kvkActive && !!company && !person:
        nameContent = (
          <CommercialProfileName
            company={company!}
            isActive={false}
            tutorial={
              'Hier ziet u uw bedrijfsgegevens uit het handelsregister van de KvK;left-bottom'
            }
            onClick={() => history.push(AppRoutes.KVK)}
          />
        );
        break;
    }
    return nameContent;
  }, [person, company, history]);

  return (
    <span
      className={classnames(
        styles.ProfileName,
        styles[`ProfileName--${profileType}`]
      )}
    >
      {nameContent || <LoadingContent barConfig={[['15rem', '1rem', '0']]} />}
    </span>
  );
}
