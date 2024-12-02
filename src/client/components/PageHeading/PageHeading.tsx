import type { HTMLProps, ReactNode } from 'react';

import { Heading, Icon, Link } from '@amsterdam/design-system-react';
import { ChevronLeftIcon } from '@amsterdam/design-system-react-icons';
import composeClassNames from 'classnames';
import { useHistory } from 'react-router-dom';

import styles from './PageHeading.module.scss';
import { ComponentChildren, LinkProps } from '../../../universal/types';
import LoadingContent from '../LoadingContent/LoadingContent';

export interface PageHeadingProps
  extends Omit<HTMLProps<HTMLHeadingElement>, 'size'> {
  children: ComponentChildren;
  backLink?: LinkProps;
  icon?: ReactNode;
  className?: string;
  isLoading?: boolean;
}

export default function PageHeading({
  children,
  className,
  icon,
  backLink,
  isLoading,
  ...rest
}: PageHeadingProps) {
  const classNames = composeClassNames(
    styles.PageHeading,
    !!icon && styles.hasIcon,
    !!backLink && styles.hasBackLink,
    className
  );

  const history = useHistory();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (history.length > 1) {
      history.goBack();
    } else {
      history.push('/');
    }
  };

  return (
    <header className={classNames} {...rest}>
      {!!icon && (
        <span aria-hidden="true" className={styles.Icon}>
          {icon}
        </span>
      )}
      <div className={styles.HeadingInner}>
        {!!backLink && (
          <Link href={'/'} className={styles.BackLink} onClick={handleClick}>
            <Icon svg={ChevronLeftIcon} size="level-5" />
            <span>{history.length > 1 ? 'Terug' : 'Home'}</span>
          </Link>
        )}
        <Heading level={2} size="level-1">
          {isLoading ? (
            <LoadingContent
              className={styles.LoadingContentHeading}
              barConfig={[['50%', '3rem', '0']]}
            />
          ) : (
            children
          )}
        </Heading>
      </div>
    </header>
  );
}
