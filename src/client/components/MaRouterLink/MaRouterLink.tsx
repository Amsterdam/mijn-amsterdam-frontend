import { Link, LinkProps } from '@amsterdam/design-system-react';
import { useHistory } from 'react-router-dom';

export function MARouterLink({ href, children }: LinkProps) {
  const history = useHistory();
  return (
    <Link
      href={href}
      onClick={(event) => {
        event.preventDefault();
        history.push(href);
      }}
    >
      {children}
    </Link>
  );
}
