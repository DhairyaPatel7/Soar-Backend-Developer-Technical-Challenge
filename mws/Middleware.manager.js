const authMiddleware = require('./auth.middleware');
const roleMiddleware = require('./role.middleware');

module.exports = class MiddlewareManager {
    constructor(app) {
        this.app = app;
    }

    applyAuthMiddleware() {
        this.app.use(authMiddleware);
    }

    applyRoleMiddleware(roles) {
        return roleMiddleware(roles);
    }
}