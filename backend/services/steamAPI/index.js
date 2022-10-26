import express from "express";
import morgan from 'morgan';
import bodyParser from "body-parser";

import {
    query as checkquery,
    validationResult,
    body as checkbody,
    oneOf as checkOneOf,
    header as checkheader
} from "express-validator";
import {svcConfig, logger} from "./infrastruc.js";
import {SteamApiMethods, SteamClientCluster} from "./steamAPI.js";

process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err.message, err.stack);
});
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection:', err.message, err.stack);
});

const app = express();

app.use(bodyParser.json());
app.use(morgan((tokens, req, res) => {
    const status = tokens.status(req, res);
    const base = `${tokens.status(req, res)} ${tokens.method(req, res)} ${tokens.url(req, res)} in ${tokens['response-time'](req, res)}ms`;
    const verbose = svcConfig.logLevel >= 3 ? ` RequestBody: ${JSON.stringify(req.body)}` : '';
    if (svcConfig.logLevel < 0)
        return undefined;
    if (status >= 500)
        return logger.toText.error(base + verbose);
    else if (status >= 400)
        return logger.toText.warn(base + verbose);
    else
        return logger.toText.info(base + verbose);
}));

const cluster = new SteamClientCluster();

app.get('/searchUser', [
    checkOneOf([
        checkquery('name').isString().isLength({min: 0, max: 64}).isAlphanumeric('en-US', {ignore: '_-'}),
        checkquery('email').isEmail()
    ])
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next) => {
    const validateErr = validationResult(req);
    if (!validateErr.isEmpty())
        return res.status(400).json({error: 1, code: 'searchUser.bad', message: validateErr.array()});
    try {
        let userId;
        if (req.query.name) {
            if (SteamApiMethods.searchUserNameEA)
                userId = await cluster.invokeMethod(SteamApiMethods.searchUserNameEA, req.query.name).then(r => r[0]?.pidId);
            else
                userId = await cluster.invokeMethod(SteamApiMethods.searchUserName, req.query.name).then(r => r[0]);
        } else
            userId = await cluster.invokeMethod(SteamApiMethods.searchUserEmail, req.query.email);

        if (!userId)
            return res.status(404).json({
                error: 1,
                code: 'searchUser.notFound',
                message: 'no user found by this criteria.'
            });
        return res.status(200).json({success: 1, code: 'searchUser.ok', data: userId + ''})
    } catch (err) {
        next(err);
    }
});

app.use((err, req, res, next) => {    // error handler
    if (err instanceof EaApiError) {
        logger.error(`SteamAPIError: ${err.statusCode} ${err.message}`, err.body, err.stack);
        switch (err.statusCode) {
            case 400:
                return res.status(400).json({error: 1, code: 'server.reqestError', message: err.body});
            default:
                return res.status(500).json({error: 1, code: 'server.error', message: err.message});
        }
    } else {
        logger.error(err.message, err.stack);
        return res.status(500).json({error: 1, code: 'server.error', message: err.message});
    }
});

app.use((req, res, next) => {
    res.status(404).json({error: 1, code: 'request.404'});
});

app.listen(svcConfig.port, () => {
    logger.success(`Service start at ${svcConfig.address}:${svcConfig.port}`)
});