import { Router, Request, Response } from 'express';
import { requireAuth } from '../middlewares/guard';
import { gOauth2Client, prisma } from '..';
import crypto from 'crypto';
import resWrap from '../utils/responseWrapper';
import { google } from 'googleapis';
import { GoogleAuthScopes } from '../constants';

const authRouter = Router();

authRouter.get('/login', (req: Request, res: Response) => {
    const state = crypto.randomBytes(32).toString('hex');
    req.session.state = state;
    console.log('State in login:', state);
    console.log('Session:', req.session);
    const url = gOauth2Client.generateAuthUrl({
        // access_type: 'offline',
        state,
        include_granted_scopes: false,
        scope: GoogleAuthScopes
    });
    res.redirect(url);
});

authRouter.get('/callback', async (req: Request, res: Response) => {
    // Handle the OAuth 2.0 server response
    const q = req.query;
    if (!q.code) {
        console.log('No code in query');
        res.end('No code in query');
        return;
    }
    console.log(q);
    console.log('State:', req.session.state);
    if (q.error) { // An error response e.g. error=access_denied
        console.log('Error:' + q.error);
        res.status(401).send('Error:' + q.error);
        return;
    } else if (q.state !== req.session.state) { //check state value
        console.log('State mismatch. Possible CSRF attack');
        res.status(401).send('State mismatch. Possible CSRF attack');
        return;
    }
    
    const consentScope = (q.scope as string).split(' ');
    console.log('Consent scope:', consentScope);
    console.log('GoogleAuthScopes:', consentScope.includes(GoogleAuthScopes[0]));

    if (!consentScope.includes(GoogleAuthScopes[0]) || !consentScope.includes(GoogleAuthScopes[1])) {
        console.log('Scope mismatch');
        res.status(401).send('Scope mismatch. Please make sure you assigned group permissions to the app');
        return;
    }

    const { tokens } = await gOauth2Client.getToken(q.code as string);
    gOauth2Client.setCredentials(tokens);
    
    const userInfo = await google.oauth2({
        auth: gOauth2Client,
        version: 'v2'
    }).userinfo.get();

    if (!userInfo.data.email?.endsWith('@gmail.com')){
        const groups = await google.admin('directory_v1').groups.list({
            auth: gOauth2Client,
            userKey: userInfo.data.email as string,
        });
    
        console.log('groups', groups); //FIXME: check if user is in the right group
    }

    const userProfile = await prisma.user.findUnique({
        where: {
            email: userInfo.data.email as string
        },
        select: {
            id: true,
            admin: true,
        }
    });

    if (!userProfile) {
        res.status(401).send('User not found');
        return;
    }

    req.session.user = {
        ...userInfo.data,
        isAdmin: userProfile.admin,
    }
    
    res.send(resWrap(req.session.user));


});

authRouter.get('/probe', requireAuth, (req: Request, res: Response) => {
    const user = req.session.user;
    res.send(resWrap(user));
});

authRouter.get('/logout', (req: Request, res: Response) => {
    req.session.destroy(() => {
        if (req.query.redirect) {
            res.redirect(req.query.redirect as string);
        }
        else {
            res.send('Logged out');
        }
    });
});

export default authRouter;