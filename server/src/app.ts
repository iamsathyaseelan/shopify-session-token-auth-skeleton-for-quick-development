import dotenv from "dotenv";
import express, {Response, Request, NextFunction} from "express";
import ApiRouter from "./routers/ApiRouter";
import AuthRouter from "./routers/AuthRouter";
import ErrorHandler from "./models/ErrorHandler";
import {AuthMiddleware} from "./middlewares/AuthMiddleware";
import cors from "cors";

dotenv.config();

class Server {
    public app = express();
    public apiRouter = ApiRouter;
    public auth = AuthRouter;
}

const corsOptions = {
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE"
};

const server = new Server();
server.app.use('/api/v1', cors(corsOptions), AuthMiddleware, server.apiRouter);
server.app.use('/auth', cors(corsOptions), server.auth);

server.app.use((err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
    res.status(err.statusCode || 500).json({
        error: true,
        statusCode: err.statusCode,
        message: err.message
    });
});

(() => {
    const port = process.env.PORT || 8000;
    server.app.listen(port, () => {
        console.log(`Listen on port ${port}`);
    })
})();
