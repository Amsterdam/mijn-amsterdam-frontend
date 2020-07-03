import { ComponentChildren, LinkProps } from '../../../universal/types';
import Heading, { HeadingTagName } from '../Heading/Heading';
import React, { HTMLProps } from 'react';

import { IconChevronLeft } from '../../assets/icons';
import Linkd from '../Button/Button';
import LoadingContent from '../LoadingContent/LoadingContent';
import composeClassNames from 'classnames';
import styles from './PageHeading.module.scss';

export interface PageHeadingProps
  extends Omit<HTMLProps<HTMLHeadingElement>, 'size'> {
  children: ComponentChildren;
  backLink?: LinkProps;
  el?: HeadingTagName;
  icon?: JSX.Element;
  className?: string;
  isLoading?: boolean;
}

export default function PageHeading({
  el = 'h2',
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
  return (
    <header className={classNames} {...rest}>
      {!!icon && (
        <span aria-hidden="true" className={styles.Icon}>
          {icon}
        </span>
      )}
      <div className={styles.HeadingInner}>
        {!!backLink && (
          <Linkd
            icon={IconChevronLeft}
            className={styles.BackLink}
            href={backLink.to}
          >
            {backLink.title}
          </Linkd>
        )}
        <Heading el={el} size="large">
          {!isLoading ? (
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
