import 'core-js/actual/array/to-sorted';
import 'core-js/actual/array/find-last';
import 'core-js/actual/array/find-index';
import 'core-js/actual/array/find-last-index';
import 'core-js/actual/string/replace-all';

import './styles/bob.scss';
import { startApp } from '../start-app.ts';

startApp(() => import('./render-bob.tsx'));
