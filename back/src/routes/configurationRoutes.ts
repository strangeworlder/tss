import { Router, type Request, type Response } from 'express';
import { ConfigurationController } from '../controllers/ConfigurationController';
import { isAdmin } from '../middleware/auth';

const router = Router();

// Global delay settings routes
router.get('/global-delay', isAdmin, (req: Request, res: Response) =>
  ConfigurationController.getInstance().getGlobalDelay(req, res)
);
router.put('/global-delay', isAdmin, (req: Request, res: Response) =>
  ConfigurationController.getInstance().updateGlobalDelay(req, res)
);

// Content override routes
router.get('/content-override/:contentId', isAdmin, (req: Request, res: Response) =>
  ConfigurationController.getInstance().getContentOverride(req, res)
);
router.post('/content-override/:contentId', isAdmin, (req: Request, res: Response) =>
  ConfigurationController.getInstance().createContentOverride(req, res)
);
router.delete('/content-override/:contentId', isAdmin, (req: Request, res: Response) =>
  ConfigurationController.getInstance().removeContentOverride(req, res)
);

export default router;
