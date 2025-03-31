import { Router, Request, Response } from 'express';
import { requireAdmin } from '../middlewares/guard';
import { prisma } from '..';
import resWrap from '../utils/responseWrapper';

const userRouter = Router();

// privilege elevation
userRouter.post('/elevator', async (req: Request, res: Response) => {
    const { floor, call } = req.body;
    const user = await prisma.user.findUnique({
        where: {
            id: floor
        }
    });
    if (!user) {
        res.send(resWrap(null, -1, 'User not found'));
        return;
    }
    const adminCount = await prisma.user.count({
        where: {
            admin: true
        }
    });
    if (adminCount === 1 && call === false) {
        res.send(resWrap(null, -1, 'Cannot revoke the last admin'));
        return;
    }
    const updatedUser = await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            admin: call as boolean
        }
    });

    res.send(resWrap(updatedUser));
});

// get all users
userRouter.get('/', requireAdmin, async (req: Request, res: Response) => {
    const users = await prisma.user.findMany();
    res.send(resWrap(users));
});

userRouter.post('/', requireAdmin, async (req: Request, res: Response) => {
    const { email, name } = req.body;
    const user = await prisma.user.create({
        data: {
            email,
            name,
            thirdPartyId: '',
        }
    });
    res.send(resWrap(user));
});

// activate user
userRouter.patch('/:id', requireAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await prisma.user.update({
        where: {
            id
        },
        data: {
            disabled: false
        }
    });
    res.send(resWrap(user));
});

// delete user
userRouter.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { permanent } = req.query;

    const user = await prisma.user.findUnique({
        where: {
            id
        }
    });

    if (!user) {
        res.send(resWrap(null, -1, 'User not found'));
        return;
    }
    
    if (user.email === req.user?.email) {
        res.send(resWrap(null, -1, 'Cannot delete yourself'));
        return;
    }

    // TODO: bool casting
    if (permanent === 'true') {
        await prisma.user.delete({
            where: {
                id
            }
        });
    }else {
        await prisma.user.update({
            where: {
                id
            },
            data: {
                disabled: true
            }
        });
    }
    res.send(resWrap(null, 0, 'User deleted'));
});




export default userRouter;