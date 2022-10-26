import EventEmitter from "events";
import fs from "fs"
import { Logger } from "../../logger.js";

/** @type
 * {{address:string, port:string, logLevel: number, accounts:{name:string,sid:string,remid:string}[]}}
 **/
const svcConfig = JSON.parse(fs.readFileSync("./services/steamAPI/config.json"));

const logger = new Logger('steamAPI', svcConfig.logLevel);

export {
    logger,
    svcConfig
}

