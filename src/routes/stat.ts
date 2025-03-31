import { Router } from 'express';
const statRouter = Router();

// import { requireAuth } from '../middlewares/guard';
import { SrsService } from '../services/SrsService';


statRouter.get('/clients', async (req, res) => {
    const { page, size } = req.query;
    const clientList = await SrsService.fetchAllClients(Number(page), Number(size));
    res.json({
        code: 0,
        data: clientList,
    });
});



export default statRouter;