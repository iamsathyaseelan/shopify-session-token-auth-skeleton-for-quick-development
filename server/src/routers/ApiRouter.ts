import {Router} from 'express';
import DashboardRouter from "./DashboardRouter";
import SettingsRouter from "./SettingsRouter";

class ApiRouter {
    private _router = Router();
    private _dashboardRouter = DashboardRouter;
    private _settingsRouter = SettingsRouter;

    get router() {
        return this._router;
    }

    constructor() {
        this._configure();
    }

    private _configure() {
        this._router.use('/dashboard', this._dashboardRouter);
        this._router.use('/settings', this._settingsRouter);
    }
}

export = new ApiRouter().router;
