// @ts-expect-error core-js may not provide declarations for this side-effect polyfill.
import 'core-js/actual/array/to-sorted';
// @ts-expect-error core-js may not provide declarations for this side-effect polyfill.
import 'core-js/actual/array/find-last';
// @ts-expect-error core-js may not provide declarations for this side-effect polyfill.
import 'core-js/actual/array/find-index';
// @ts-expect-error core-js may not provide declarations for this side-effect polyfill.
import 'core-js/actual/array/find-last-index';
// @ts-expect-error core-js may not provide declarations for this side-effect polyfill.
import 'core-js/actual/string/replace-all';

import './styles/bob.scss';
import { startApp } from '../start-app.ts';

startApp(() => import('./render-bob.tsx'));
