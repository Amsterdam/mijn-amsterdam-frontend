import classnames from 'classnames';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import type { KVKData } from '../../../server/services/kvk';
import { AppRoutes, FeatureToggle } from '../../../universal/config';
import { getFullName } from '../../../universal/helpers';
import { BRPData } from '../../../universal/types';
import { IconHomeCommercial, IconProfile } from '../../assets/icons';
import { useAppStateReady } from '../../hooks';
import { Button } from '../Button/Button';
import LoadingContent from '../LoadingContent/LoadingContent';
import styles from './ProfileName.module.scss';

interface CommercialProfileNameProps {
  company?: KVKData;
  onClick?: (event: any) => void;
  isActive: boolean;
}

function CommercialProfileName({
  company,
  onClick,
  isActive,
}: CommercialProfileNameProps) {
  const label = company?.onderneming.handelsnaam || 'Mijn onderneming';
  return (
    <Button
      onClick={onClick}
      icon={IconHomeCommercial}
      variant="plain"
      lean={true}
      iconSize="24"
      className={classnames(
        styles.ProfileLink,
        styles['ProfileLink--commercial'],
        isActive && styles['ProfileLink--active']
      )}
    >
      {label}
    </Button>
  );
}

interface PrivateProfileNameProps {
  person?: BRPData['persoon'];
  onClick?: (event: any) => void;
  isActive: boolean;
}

function PrivateProfileName({
  person,
  onClick,
  isActive,
}: PrivateProfileNameProps) {
  const label = person?.opgemaakteNaam
    ? person.opgemaakteNaam
    : person?.voornamen
      ? getFullName(person)
      : 'Mijn gegevens';
  return (
    <Button
      onClick={onClick}
      icon={IconProfile}
      variant="plain"
      lean={true}
      iconSize="24"
      className={classnames(
        styles.ProfileLink,
        styles['ProfileLink--private'],
        isActive && styles['ProfileLink--active']
      )}
    >
      {label}
    </Button>
  );
}

interface ProfileNameProps {
  person?: BRPData['persoon'] | null;
  company?: KVKData | null;
  profileAttribute?: string;
  profileType: ProfileType;
}

export function ProfileName({
  person,
  company,
  profileAttribute,
  profileType,
}: ProfileNameProps) {
  const history = useHistory();
  const isAppStateReady = useAppStateReady();

  const [appStateFirstLoad, setAppStateFirstLoad] = useState<undefined | true>(
    undefined
  );

  useEffect(() => {
    if (isAppStateReady) {
      setAppStateFirstLoad(true);
    }
  }, [isAppStateReady]);

  const nameContent = useMemo(() => {
    let nameContent: undefined | string | ReactNode;

    switch (true) {
      case profileType === 'private':
        nameContent = (
          <PrivateProfileName
            person={person!}
            isActive={false}
            onClick={() => history.push(AppRoutes.BRP)}
          />
        );
        break;
      case FeatureToggle.kvkActive && profileType === 'commercial':
        nameContent = (
          <CommercialProfileName
            company={company!}
            isActive={false}
            onClick={() => history.push(AppRoutes.KVK)}
          />
        );
        break;
      case !!profileAttribute:
        nameContent = (
          <span
            className={classnames(
              styles.ProfileLink,
              styles['ProfileLink--private'],
              styles['ProfileLink--private-attributes'],
              styles['ProfileLink--active']
            )}
          >
            <IconProfile className={styles.IconProfile} /> {profileAttribute}
          </span>
        );
        break;
    }
    return nameContent;
  }, [person, company, history, profileAttribute, profileType]);

  return (
    <>
      {appStateFirstLoad === true ? (
        <>{nameContent}</>
      ) : (
        <LoadingContent
          barConfig={[['15rem', '1rem', '0']]}
          className={styles.ProfileLinkLoader}
        />
      )}
    </>
  );
}
