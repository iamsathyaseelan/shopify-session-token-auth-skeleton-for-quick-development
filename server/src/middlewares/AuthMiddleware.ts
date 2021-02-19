import {Request, Response, NextFunction} from "express";
import ErrorHandler from "../models/ErrorHandler";
import {getAuthResponse} from "../utils";
import {Buffer} from 'buffer';
import * as crypto from 'crypto';

export type TUtils = (a: string) => string
export type TB64UrlEncode = (a: Buffer) => string

export interface IPayload {
    iss: string;
    dest: string;
    aud: string;
    sub: string;
    exp: number;
    nbf: number;
    iat: number;
    jti: string;
}

const atob: TUtils = (a = '') => Buffer.from(a, 'base64').toString('binary');
const base64UrlEncode: TB64UrlEncode = (buffer) => buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

export const AuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("x-session-token");
    const shopOrigin = req.header("shopOrigin");
    if (shopOrigin && shopOrigin != "" && shopOrigin !== undefined) {
        const invalidAuth = getAuthResponse(shopOrigin.toString());
        if (token && token != "" && token !== undefined) {
            const secret: string = process.env.SHOPIFY_SECRET_KEY || "";
            const auth: string[] = token.split('.');
            const headerPayload: string = [auth[0], auth[1]].join('.');
            const authObject: Record<('header' | 'payload' | 'signature'), string> = {
                header: atob(auth[0]),
                payload: atob(auth[1]),
                signature: auth[2],
            }
            const signedBuffer: Buffer = crypto.createHmac('sha256', secret).update(headerPayload).digest();
            const isVerified: boolean = authObject.signature === base64UrlEncode(signedBuffer);

            if (!isVerified) {
                console.log("invalid session token")
                return res.status(403).json(invalidAuth);
            }

            const payload: IPayload = JSON.parse(authObject.payload);
            const time = new Date().getTime() / 1000
            const isExpired: boolean = payload.exp <= time

            if (isExpired) {
                console.error('Token is expired')
                return res.status(403).json(invalidAuth);
            }
            return next();
        } else {
            return res.status(403).json(invalidAuth);
        }
    } else {
        return next(new ErrorHandler(400, "Shop origin missing"));
    }
}
