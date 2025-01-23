import { Router, Request, Response } from 'express';
import { requireAuth } from '../middlewares/guard';
import { gAuthClient } from '..';

const authRouter = Router();

authRouter.get('/login', (req: Request, res: Response) => {
    const url = gAuthClient.generateAuthUrl(); //TODO: add scope
    res.redirect(url);
});

authRouter.get('/probe', requireAuth ,(req: Request, res: Response) => {
    res.send(req.user);
});

export default authRouter;