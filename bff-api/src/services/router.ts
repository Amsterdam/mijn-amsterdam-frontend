import express from 'express';
import { handleRoute as handleRouteServicesDirect } from './services-direct';
import { handleRoute as handleRouteServicesRelated } from './services-related';
import { handleRoute as handleRouteServicesTips } from './services-tips';

export const router = express.Router();

router.use('/services/tips', handleRouteServicesTips);
router.use('/services/related', handleRouteServicesRelated);
router.use('/services/direct', handleRouteServicesDirect);
