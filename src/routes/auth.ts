import { Router, Request, Response } from 'express';
import { requireAuth } from '../middlewares/guard';
import { prisma } from '..';
import resWrap from '../utils/responseWrapper';
import { GoogleAuthScopes, OpenIDEndpoint } from '../constants';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import OAuth2Strategy, { VerifyCallback } from 'passport-oauth2';
import { OpenIDProfile } from '../types';
import axios from 'axios';


const authRouter = Router();

authRouter.get('/google', passport.authenticate('google', {
    scope: GoogleAuthScopes,
}));


authRouter.get('/openid', passport.authenticate('oauth2', {
    scope: 'openid profile email',
}));

authRouter.get('/openid/callback', passport.authenticate('oauth2', {
    successRedirect: process.env.CONTROL_ENDPOINT + '/login',
    failureRedirect: process.env.CONTROL_ENDPOINT + '/login'
}), (req: Request, res: Response) => {
    res.redirect(process.env.CONTROL_ENDPOINT + '/');
});

authRouter.get('/google/callback', passport.authenticate('google', {
    successRedirect: process.env.CONTROL_ENDPOINT + '/login',
    failureRedirect: process.env.CONTROL_ENDPOINT + '/login'
}), (req: Request, res: Response) => {
    res.redirect(process.env.CONTROL_ENDPOINT + '/');
});

authRouter.get('/probe', requireAuth, (req: Request, res: Response) => {
    const user = req.user;
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

passport.use(new GoogleStrategy.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, cb) => {
    const user = await prisma.user.findUnique({
        where: {
            email: profile.emails?.[0].value || '',
        },
        select: {
            email: true,
            name: true,
            id: true,
            admin: true,
        }
    });
    if (!user) {
        return cb(new Error('User not found'));
    }
    return cb(null, {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.admin
    });
}));

passport.use(new OAuth2Strategy({
    authorizationURL: OpenIDEndpoint.authorization_endpoint,
    tokenURL: OpenIDEndpoint.token_endpoint,
    clientID: process.env.OPENID_CLIENT_ID || '',
    clientSecret: process.env.OPENID_CLIENT_SECRET || '',
    callbackURL: '/auth/openid/callback',
    scope: 'openid profile email',
}, async (accessToken: string, refreshToken: string, profile: OpenIDProfile, cb: VerifyCallback) => {
    const openIdUserInfo = await axios.get(OpenIDEndpoint.userinfo_endpoint, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const userInfo = openIdUserInfo.data;
    if (!userInfo) {
        return cb(new Error('User not found'));
    }
    cb(null, {
        id: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email,
        isAdmin: false,
    });
})  
);