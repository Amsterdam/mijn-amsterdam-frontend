import classnames from 'classnames';
import React, { ReactNode, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { KVKSourceDataContent } from '../../../server/services/kvk';
import { AppRoutes, FeatureToggle } from '../../../universal/config';
import { getFullName } from '../../../universal/helpers';
import { BRPData } from '../../../universal/types';
import { IconProfile, IconSuitcase } from '../../assets/icons';
import { useProfileType } from '../../hooks/useProfileType';
import { Button } from '../Button/Button';
import LoadingContent from '../LoadingContent/LoadingContent';
import styles from './ProfileName.module.scss';

interface CommercialProfileNameProps {
  company?: KVKSourceDataContent;
  onClick?: (event: any) => void;
  isActive: boolean;
  hasTutorial: boolean;
}

function CommercialProfileName({
  company,
  onClick,
  isActive,
  hasTutorial,
}: CommercialProfileNameProps) {
  return (
    <Button
      onClick={onClick}
      icon={IconSuitcase}
      variant="plain"
      lean={true}
      className={classnames(
        styles.ProfileLink,
        styles['ProfileLink--commercial'],
        isActive && styles['ProfileLink--active']
      )}
    >
      <span
        data-tutorial-item={
          hasTutorial
            ? 'Hier kunt u schakelen naar uw zakelijke profiel;left-bottom'
            : ''
        }
      >
        {company?.onderneming?.handelsnamen
          ? company.onderneming.handelsnamen[0]
          : 'Zakelijk'}
      </span>
    </Button>
  );
}

interface PrivateProfileNameProps {
  person?: BRPData['persoon'];
  onClick?: (event: any) => void;
  isActive: boolean;
  hasTutorial: boolean;
}

function PrivateProfileName({
  person,
  onClick,
  isActive,
  hasTutorial,
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
      <span
        data-tutorial-item={
          hasTutorial
            ? 'Hier kunt u schakelen naar uw privé profiel;right-bottom'
            : ''
        }
      >
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
        hasTutorial={profileType === 'private-commercial'}
        onClick={() => setProfileType('private')}
      />
      <CommercialProfileName
        company={company}
        isActive={profileType === 'private-commercial'}
        hasTutorial={profileType === 'private'}
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
            hasTutorial={true}
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
            hasTutorial={true}
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
