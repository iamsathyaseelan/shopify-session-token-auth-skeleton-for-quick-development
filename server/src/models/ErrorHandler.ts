class ErrorHandler extends Error {
    constructor(
        public statusCode: number,
        public message: string
    ) {
        super();
    }
}
export default ErrorHandler;
