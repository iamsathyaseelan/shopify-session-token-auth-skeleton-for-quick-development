import {NextFunction, Request, Response, Router} from "express";
import ErrorHandler from "../models/ErrorHandler";
import crypto from "crypto";
import querystring from "querystring";
import axios from "axios";
import {getAuthRedirectUri, isValidShopUrl} from "../utils"

const _ = require('lodash');
const cookie = require('cookie');
const nonce = require('nonce')();

class AuthRouter {
    private _router = Router();

    get router() {
        return this._router;
    }

    constructor() {
        this._configure();
    }

    private _configure() {
        this.router.get('/', (req: Request, res: Response, next: NextFunction) => {
            try {
                const shopName = req.query.shop;
                if (shopName && shopName != "" && shopName != null && shopName != "null") {
                    if(isValidShopUrl(shopName.toString())) {
                        const installUri = getAuthRedirectUri(shopName.toString());
                        //TODO: make necessary changes to check shop installed for first time
                        return res.json({redirect: true, redirect_uri: installUri});
                    }else{
                        return next(new ErrorHandler(400, 'Invalid shop URL'));
                    }
                } else {
                    return next(new ErrorHandler(400, 'Shop parameter missing'));
                }
            } catch (error) {
                return next(error);
            }
        })
        this.router.get('/callback', (req: Request, res: Response, next: NextFunction) => {
            try {
                const {shop, hmac, code, state} = req.query;
                const stateCookie = cookie.parse(req.headers.cookie).state;
                console.log(state, stateCookie);
                // if (state !== stateCookie) {
                //     return next(new ErrorHandler(403, 'Request origin cannot be verified'));
                // }
                if (shop && hmac && code) {
                    const mapObject = Object.assign({}, req.query);
                    delete mapObject['hmac'];
                    // @ts-ignore
                    const message = querystring.stringify(mapObject);
                    // @ts-ignore
                    let providedHmac = Buffer.from(hmac, 'utf-8');
                    // @ts-ignore
                    const generatedHash = Buffer.from(crypto.createHmac('sha256', process.env.SHOPIFY_SECRET_KEY).update(message).digest('hex'), 'utf-8');
                    let hashEquals;
                    try {
                        hashEquals = crypto.timingSafeEqual(generatedHash, providedHmac);
                    } catch (e) {
                        hashEquals = false;
                    }
                    if (!hashEquals) {
                        return next(new ErrorHandler(400, 'HMAC Validation failed'));
                    }
                    const accessTokenRequestUrl = `https://${shop}/admin/oauth/access_token`;
                    const accessTokenPayload = {
                        client_id: process.env.SHOPIFY_API_KEY,
                        client_secret: process.env.SHOPIFY_SECRET_KEY,
                        code: code
                    }
                    axios.post(accessTokenRequestUrl, accessTokenPayload).then((accessTokenResponse) => {
                        const accessToken = _.get(accessTokenResponse, 'data.access_token', false);
                        if (accessToken) {
                            return res.redirect(`https://${shop}/admin/apps`)
                        }
                        return res.json({access_token: accessToken})
                    }).catch((e) => {
                        return next(new ErrorHandler(400, `Fetching access token Failed with ${e.message}`));
                    });
                } else {
                    return next(new ErrorHandler(400, 'Required parameters missing'));
                }
            } catch (error) {
                return next(error);
            }
        })
    }
}

export = new AuthRouter().router;
