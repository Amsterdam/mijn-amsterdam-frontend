import React, { HTMLProps } from 'react';
import styles from './PageHeading.module.scss';
import composeClassNames from 'classnames';
import Heading, { HeadingTagName } from 'components/Heading/Heading';
import { ComponentChildren, LinkProps } from 'App.types';
import ButtonLink from 'components/Button/Button';
import { ReactComponent as CaretLeft } from 'assets/icons/Chevron-Left.svg';
import LoadingContent from 'components/LoadingContent/LoadingContent';

export interface PageHeadingProps
  extends Omit<HTMLProps<HTMLHeadingElement>, 'size'> {
  children: ComponentChildren;
  backLink?: LinkProps;
  el?: HeadingTagName;
  icon?: JSX.Element;
  className?: any;
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
    !!icon && styles.HasIcon,
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
          <ButtonLink
            icon={CaretLeft}
            className={styles.BackLink}
            to={backLink.to}
          >
            {backLink.title}
          </ButtonLink>
        )}
        {isLoading && (
          <LoadingContent
            className={styles.LoadingContentHeading}
            barConfig={[['50%', '3rem', '0']]}
          />
        )}
        <Heading el={el} size="large">
          {!isLoading && children}
        </Heading>
      </div>
    </header>
  );
}
