
import { Fetch } from '../utils/fetch'
import * as winston from 'winston'

export interface AuthorizeData {
    TOKEN: string
    API_SERVER: string
    ORG_NAME: string
}

export class ServiceBase {
    public sourceApiRequest = new Fetch(this.originAuthorizeData)
    public targetApiRequest = new Fetch(this.targetAuthorizeData)

    constructor(public originAuthorizeData: AuthorizeData, public targetAuthorizeData: AuthorizeData) {

    }

    public logger = winston.createLogger({
      format: winston.format.json(),
      defaultMeta: { service: 'user-service' },
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
      ]
    });
}