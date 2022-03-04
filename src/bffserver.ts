/* eslint-disable import/first */
/// <reference path="./react-app-env.d.ts" />
import dotenv from 'dotenv';

// Compilation entrypoint
const ENV_LOCAL = '.env.local';
dotenv.config({ path: ENV_LOCAL });

import './server/app';
