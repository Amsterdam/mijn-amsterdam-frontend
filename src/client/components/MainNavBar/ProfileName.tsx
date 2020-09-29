import classnames from 'classnames';
import React, { ReactNode, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { KVKSourceDataContent } from '../../../server/services/kvk';
import { AppRoutes, FeatureToggle } from '../../../universal/config';
import { getFullName } from '../../../universal/helpers';
import { BRPData } from '../../../universal/types';
import { IconProfile, IconHomeCommercial } from '../../assets/icons';
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
      <span data-tutorial-item={tutorial}>
        {company?.onderneming?.handelsnaam || 'Zakelijk'}
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
      <span data-tutorial-item={tutorial}>
        {person?.opgemaakteNaam ? getFullName(person) : 'Mijn gegevens'}
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
            ? 'Hier kunt u schakelen naar uw privé profiel;left-bottom'
            : ''
        }
        onClick={() => setProfileType('private')}
      />
      <CommercialProfileName
        company={company}
        isActive={profileType === 'private-commercial'}
        tutorial={
          profileType === 'private'
            ? 'Hier kunt u schakelen naar uw zakelijke profiel;right-bottom'
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
      case !FeatureToggle.profileToggleActive || (!!person && !company):
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
      case !!person && !!company:
        nameContent = <PrivateCommercialProfileToggle person={person!} />;
        break;
      case !!company && !person:
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
