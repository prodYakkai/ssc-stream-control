import { Router, Request, Response } from 'express';
import { prisma } from '..';
import resWrap from '../utils/responseWrapper';

const eventBrandingRouter = Router();

eventBrandingRouter.get('/:eventId', async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const [branding, ads ] = await prisma.$transaction([
        prisma.eventBranding.findUnique({
            where: {
                eventId
            }
        }),
        prisma.eventAd.findMany({
            where: {
                eventId
            }
        })
    ]);
    res.json(resWrap({ branding, ads }));
});

eventBrandingRouter.put('/:eventId', async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const event = await prisma.eventBranding.update({
        where: {
            eventId
        },
        data: req.body
    });
    res.json(resWrap(event));
});

// just update the branding info
eventBrandingRouter.patch('/:eventId', async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const event = await prisma.eventBranding.update({
        where: {
            eventId
        },
        data: req.body
    });
    res.json(resWrap(event));
});

// update the ads
eventBrandingRouter.patch('/:eventId/ad', async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const ads = await prisma.eventAd.create({
        data: {
            eventId,
            ...req.body
        }
    });
    res.json(resWrap(ads));
});

// delete the ads
eventBrandingRouter.delete('/ad/:adId', async (req: Request, res: Response) => {
    const { adId } = req.params;
    const { remove } = req.query;
    if (remove === 'true') {
        await prisma.eventAd.delete({
            where: {
                id: adId
            }
        });
        res.json(resWrap({}));
        return;
    }

    const update = await prisma.eventAd.update({
        where: {
            id: adId
        },
        data: {
            disabled: true
        }
    });
    res.json(resWrap(update));
});

// undo the disable
eventBrandingRouter.patch('/ad/:adId', async (req: Request, res: Response) => {
    const { adId } = req.params;
    const update = await prisma.eventAd.update({
        where: {
            id: adId
        },
        data: {
            disabled: false
        }
    });
    res.json(resWrap(update));
});



export default eventBrandingRouter;