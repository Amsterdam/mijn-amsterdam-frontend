import { useLocation, Navigate } from 'react-router';

import { NotFound } from './NotFound.tsx';
import { isPrivateRoute } from '../../App.routes.tsx';
import { LandingRoute } from '../Landing/Landing-routes.ts';

export function RedirectPrivateRoutesToLanding() {
  const location = useLocation();
  const pathname = location.pathname;

  if (isPrivateRoute(pathname)) {
    // Private routes are redirected to Home
    return <Navigate to={LandingRoute.route} />;
  }

  // All other routes are presented with a 404 page
  return <NotFound />;
}
