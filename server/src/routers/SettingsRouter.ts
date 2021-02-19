import {NextFunction, Request, Response, Router} from "express";
import SettingsController from "../controllers/SettingsController"

class SettingsRouter {
    private _router = Router();
    private _controller = SettingsController;

    get router() {
        return this._router;
    }

    constructor() {
        this._configure();
    }

    private _configure() {
        this.router.get('/', (req: Request, res: Response, next: NextFunction) => {
            try {
                const result = this._controller.defaultMethod();
                res.status(200).json(result);
            } catch (error) {
                next(error);
            }
        });
    }
}

export = new SettingsRouter().router;
