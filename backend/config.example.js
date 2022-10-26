"use strict";
import fs from "fs";
import path from "path";

const config = {
    // security
    __DEBUG__: false, // WARNING: THIS WILL ENABLE NO AUTH & NO CAPTCHA FEATHURE
    secret: 'dontTellAnyOneAboutThis',  // key to sign jwt and other thing
    captchaExpiresIn: 1000 * 60 * 20,       // 2 minutes
    userTokenExpiresIn: 1000 * 60 * 60 * 24 * 7, // 7 day
    errorHelperVerbose: process.env.NODE_ENV === 'production' ? false : true,  // make the error readable to client
    // runtime
    port: process.env.port || 4002,
    address: true ? '127.0.0.1' : '0.0.0.0',
    baseDir: path.resolve('./'),
    behindProxy: 0,
    pollingTimeout: 90 * 1000,
    // database
    mysql: {
        host: '127.0.0.1',
        port: 3306,
        user: 'notroot',
        password: 'weakpasswd',
        database: 'hllban'
    },
    // gravatar
    gravatar: {
        domain: 'https://www.gravatar.com'
    },
    mail: {
        host: 'smtp.somewhere.com',
        port: 465,
        secure: true,
        user: 'somebody@somewhere.com',
        password: 'notweakpassword',
        domain: {
            origin: 'you website domain'
        },
    },
    docs: {
        info: {
            title: 'HLLBAN DOCS',
            version: '1.0.0',
            description: '',
        },
        host: '127.0.0.1:3000',
        basePath: '/',
    },
    services: {
        // deployment has 3 mode: THREAD, PROCESS, none
        // THREAD mode will start the service as a thread
        // PROCESS mode will check if the service has launched before, if not, start the service as a process
        // if none is specified, service/loader.js will not launch the service script, use it when the service is not deploy locally
        steamAPI: {

        }
    },
    // DYNAMIC CONFIGURE BEGIN
    supportLanguages: ['zh-CN', 'en-US'],
    personsToConfirm: 2,
    personsToReview: 2,
    supportGames: ['hll'],
    possiblecheatMethods: [
        'wallhack', 'aimbot', 'invisable', 'magicBullet',
        'damageChange', 'gadgetModify', 'teleport', 'attackServer'
    ],
    // DYNAMIC CONFIGURE END
}

export default config;
