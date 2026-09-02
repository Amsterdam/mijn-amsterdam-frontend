import './styles/admin.scss';
import { startApp } from '../start-app.ts';

startApp(() => import('./render-admin.tsx'));
