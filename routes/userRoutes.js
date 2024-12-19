const express = require('express');
const mongoose = require('mongoose');
const { NotFoundError, AccessDeniedError, BadRequestError } = require('../error/error');

const router = express.Router();
const authMiddleware = require('../mws/auth.middleware');
const roleMiddleware = require('../mws/role.middleware');

module.exports = (userManager) => {
    // Middleware to log request details
    router.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        console.log('Request Body:', req.body);
        next();
    });

    // Register a new user
    router.post('/register', async (req, res, next) => {
        try {
            console.log('Registering a new user...');
            const newUser = await userManager.createUser(req.body);
            console.log('User registered:', newUser);
            res.status(201).json(newUser);
        } catch (error) {
            console.error('Error registering user:', error.message);
            next(error);
        }
    });

    // Authenticate a user
    router.post('/login', async (req, res, next) => {
        try {
            console.log('Logging in a user...');
            const { email, password } = req.body;
            const authResponse = await userManager.authenticateUser(email, password);
            console.log('User logged in:', authResponse);
            res.status(200).json(authResponse);
        } catch (error) {
            console.error('Error logging in user:', error.message);
            next(error);
        }
    });

    // Get all users (restricted to superadmin)
    router.get('', authMiddleware, roleMiddleware(['superadmin']), async (req, res, next) => {
        try {
            console.log('Fetching all users...');
            const users = await userManager.getUsers();
            console.log('Users fetched:', users);
            res.status(200).json(users);
        } catch (error) {
            console.error('Error fetching users:', error.message);
            next(error);
        }
    });

    // Get user by ID (restricted to superadmin)
    router.get('/:id', authMiddleware, roleMiddleware(['superadmin']), async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                throw new BadRequestError('Invalid user ID');
            }
            console.log(`Fetching user with ID: ${req.params.id}`);
            const user = await userManager.getUserById(req.params.id);
            console.log('User fetched:', user);
            res.status(200).json(user);
        } catch (error) {
            console.error(`Error fetching user with ID ${req.params.id}:`, error.message);
            next(error);
        }
    });

    // Update user (restricted to superadmin)
    router.put('/:id', authMiddleware, roleMiddleware(['superadmin']), async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                throw new BadRequestError('Invalid user ID');
            }
            console.log(`Updating user with ID: ${req.params.id}`);
            const updatedUser = await userManager.updateUser(req.params.id, req.body);
            console.log('User updated:', updatedUser);
            res.status(200).json(updatedUser);
        } catch (error) {
            console.error(`Error updating user with ID ${req.params.id}:`, error.message);
            next(error);
        }
    });

    // Delete user (restricted to superadmin)
    router.delete('/:id', authMiddleware, roleMiddleware(['superadmin']), async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                throw new BadRequestError('Invalid user ID');
            }
            console.log(`Deleting user with ID: ${req.params.id}`);
            await userManager.deleteUser(req.params.id);
            console.log('User deleted');
            res.status(204).send();
        } catch (error) {
            console.error(`Error deleting user with ID ${req.params.id}:`, error.message);
            next(error);
        }
    });

    // Error handling middleware
    router.use((err, req, res, next) => {
        if (err instanceof NotFoundError || err instanceof AccessDeniedError || err instanceof BadRequestError) {
            return res.status(err.statusCode).json({ message: err.message });
        }

        res.status(500).send('Internal Server Error. Something broke!');
    });

    return router;
};