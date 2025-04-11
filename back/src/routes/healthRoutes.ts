import { Router, type RequestHandler } from 'express';
import { HealthController } from '../controllers/HealthController';

const router = Router();
const healthController = HealthController.getInstance();

// Basic health check endpoint
router.get('/', healthController.getBasicHealth as RequestHandler);

// Detailed health check endpoint
router.get('/detailed', healthController.getDetailedHealth as RequestHandler);

// Service-specific health check endpoint
router.get('/service/:service', healthController.getServiceHealth as RequestHandler);

export default router;
