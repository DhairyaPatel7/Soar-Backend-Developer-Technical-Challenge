const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const MiddlewareManager = require('../../mws/Middleware.manager');
const app = express();

module.exports = class UserServer {
    constructor({ config, managers }) {
        this.config = config;
        this.managers = managers;
        this.userApi = managers.userApi;
        this.school = managers.school; // Ensure school manager is available
        this.userManager = managers.user; // Ensure user manager is available
        this.classroomManager = managers.classroom; // Ensure classroom manager is available
        this.studentManager = managers.student;
        this.middlewareManager = new MiddlewareManager(app);
    }

    /** for injecting middlewares */
    use(args) {
        app.use(args);
    }

    /** server configs */
    run() {
        app.use(cors({ origin: '*' }));
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use('/static', express.static('public'));

        // Security middleware
        app.use(helmet());

        // Rate limiting middleware
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP, please try again later.'
        });
        app.use(limiter);

        // Pass managers.school to routes
        const schoolRoutes = require('../../routes/schoolRoutes')(this.school);
        app.use('/api/schools', schoolRoutes);

        // Pass managers.user to routes
        const userRoutes = require('../../routes/userRoutes')(this.userManager);
        app.use('/api/users', userRoutes);

        // Pass managers.classroom to routes
        const classroomRoutes = require('../../routes/classroomRoutes')(this.classroomManager);
        app.use('/api/classrooms', classroomRoutes);

        // Pass managers.student to routes
        const studentRoutes = require('../../routes/studentRoutes')(this.studentManager);
        app.use('/api/students', studentRoutes);

        /** an error handler */
        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).send('Something broke!');
        });

        /** a single middleware to handle all */
        app.all('/api/:moduleName/:fnName', this.userApi.mw);

        const PORT = this.config.dotEnv.USER_PORT || 3000;
        const server = http.createServer(app);
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        
    }

    getApp() {
        return app;
    }
}

module.exports.app = app;