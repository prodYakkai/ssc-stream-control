import { Router, Request, Response } from 'express';
import { requireAuth } from '../middlewares/guard';

const authRouter = Router();

authRouter.get('/login', (req: Request, res: Response) => {
    res.redirect('/auth/google');
});

authRouter.get('/probe', requireAuth ,(req: Request, res: Response) => {
    res.send(req.user);
});

export default authRouter;