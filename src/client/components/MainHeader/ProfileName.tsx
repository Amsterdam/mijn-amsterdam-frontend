import { Icon } from '@amsterdam/design-system-react';
import classnames from 'classnames';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import type { KVKData } from '../../../server/services/kvk';
import { BRPData } from '../../../universal/types';
import { IconProfile } from '../../assets/icons';
import { useAppStateReady } from '../../hooks';
import LoadingContent from '../LoadingContent/LoadingContent';
import { MaRouterLink } from '../MaLink/MaLink';
import styles from './ProfileName.module.scss';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { AppRoutes } from '../../../universal/config/routes';
import { getFullName } from '../../../universal/helpers/brp';

interface CommercialProfileNameProps {
  company?: KVKData;
  href: string;
  showIcon: boolean;
  className?: string;
}

function CommercialProfileName({
  company,
  href,
  showIcon = false,
  className,
}: CommercialProfileNameProps) {
  const label = company?.onderneming.handelsnaam || 'Mijn onderneming';
  return (
    <MaRouterLink
      className={className}
      maVariant="noDefaultUnderline"
      href={href}
    >
      {showIcon && <Icon svg={IconProfile} />}
      {label}
    </MaRouterLink>
  );
}

interface PrivateProfileNameProps {
  href: string;
  person?: BRPData['persoon'];
  showIcon: boolean;
  className?: string;
}

function PrivateProfileName({
  person,
  href,
  showIcon,
  className,
}: PrivateProfileNameProps) {
  const label = person?.opgemaakteNaam
    ? person.opgemaakteNaam
    : person?.voornamen
      ? getFullName(person)
      : 'Mijn gegevens';
  return (
    <MaRouterLink
      className={className}
      maVariant="noDefaultUnderline"
      href={href}
    >
      {showIcon && <Icon svg={IconProfile} />}
      {label}
    </MaRouterLink>
  );
}

interface ProfileNameProps {
  person?: BRPData['persoon'] | null;
  company?: KVKData | null;
  profileAttribute?: string;
  profileType: ProfileType;
  showIcons: boolean;
  className?: string;
}

export function ProfileName({
  person,
  company,
  profileAttribute,
  profileType,
  showIcons = false,
  className,
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

  const content = useMemo(() => {
    let nameContent: undefined | string | ReactNode;

    switch (true) {
      case profileType === 'private':
        nameContent = (
          <PrivateProfileName
            className={className}
            showIcon={showIcons}
            person={person!}
            href={AppRoutes.BRP}
          />
        );
        break;
      case FeatureToggle.kvkActive && profileType === 'commercial':
        nameContent = (
          <CommercialProfileName
            className={className}
            showIcon={showIcons}
            company={company!}
            href={AppRoutes.KVK}
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
              styles['ProfileLink--active'],
              className
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
        <>{content}</>
      ) : (
        <LoadingContent
          barConfig={[['15rem', '1rem', '0']]}
          className={styles.ProfileLinkLoader}
        />
      )}
    </>
  );
}
