import { LegacyRef } from 'react';

interface CompProps {
  tag: keyof JSX.IntrinsicElements;
  ref?: LegacyRef<any>;
}

const StyledComponent: React.FunctionComponent<
  CompProps & React.HTMLAttributes<HTMLOrSVGElement>
> = ({ tag: Wrapper = 'div', children, className, ...rest }) => {
  return (
    <Wrapper className={className} {...rest}>
      {children}
    </Wrapper>
  );
};

export default StyledComponent;
