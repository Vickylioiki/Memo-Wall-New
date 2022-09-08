import express from 'express';

export const isLoggedIn = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
) => {
    if (req.session.isLoggedIn) {
        next(); //要( )
        return;
    }
    res.redirect('/index.html');
    return;

}