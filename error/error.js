class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

class AccessDeniedError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AccessDeniedError';
        this.statusCode = 403;
    }
}

class BadRequestError extends Error {
    constructor(message) {
        super(message);
        this.name = 'BadRequestError';
        this.statusCode = 400;
    }
}

module.exports = {
    NotFoundError,
    AccessDeniedError,
    BadRequestError
};