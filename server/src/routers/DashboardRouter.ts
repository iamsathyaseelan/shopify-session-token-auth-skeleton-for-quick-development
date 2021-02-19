import {NextFunction, Request, Response, Router} from "express";
import DashboardController from "../controllers/DashboardController"

class DashboardRouter {
    private _router = Router();
    private _controller = DashboardController;

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

export = new DashboardRouter().router;
