const express = require('express');
const mongoose = require('mongoose');
const { NotFoundError, AccessDeniedError, BadRequestError } = require('../error/error');

const router = express.Router();
const authMiddleware = require('../mws/auth.middleware');
const roleMiddleware = require('../mws/role.middleware');

module.exports = (classroomManager) => {
    // Middleware to log request details
    router.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        console.log('Request Body:', req.body);
        next();
    });

    // Create a new classroom (restricted to superadmin and schooladmin)
    router.post('', authMiddleware, roleMiddleware(['superadmin', 'schooladmin']), async (req, res, next) => {
        try {
            console.log('Creating a new classroom...');
            const newClassroom = await classroomManager.createClassroom(req.body, req.user);
            console.log('Classroom created:', newClassroom);
            res.status(201).json(newClassroom);
        } catch (error) {
            console.error('Error creating classroom:', error.message);
            next(error);
        }
    });

    // Get all classrooms (restricted to superadmin and schooladmin)
    router.get('', authMiddleware, roleMiddleware(['superadmin', 'schooladmin']), async (req, res, next) => {
        try {
            console.log('Fetching all classrooms...');
            const classrooms = await classroomManager.getClassrooms(req.user);
            console.log('Classrooms fetched:', classrooms);
            res.status(200).json(classrooms);
        } catch (error) {
            console.error('Error fetching classrooms:', error.message);
            next(error);
        }
    });

    // Get a classroom by ID (restricted to superadmin and schooladmin)
    router.get('/:id', authMiddleware, roleMiddleware(['superadmin', 'schooladmin']), async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                throw new BadRequestError('Invalid classroom ID');
            }
            console.log(`Fetching classroom with ID ${req.params.id}...`);
            const classroom = await classroomManager.getClassroomById(req.params.id, req.user);
            console.log('Classroom fetched:', classroom);
            res.status(200).json(classroom);
        } catch (error) {
            console.error(`Error fetching classroom with ID ${req.params.id}:`, error.message);
            next(error);
        }
    });

    // Update a classroom (restricted to superadmin and schooladmin)
    router.put('/:id', authMiddleware, roleMiddleware(['superadmin', 'schooladmin']), async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                throw new BadRequestError('Invalid classroom ID');
            }
            console.log(`Updating classroom with ID ${req.params.id}...`);
            const classroom = await classroomManager.updateClassroom(req.params.id, req.body, req.user);
            console.log('Classroom updated:', classroom);
            res.status(200).json(classroom);
        } catch (error) {
            console.error(`Error updating classroom with ID ${req.params.id}:`, error.message);
            next(error);
        }
    });

    // Delete a classroom (restricted to superadmin and schooladmin)
    router.delete('/:id', authMiddleware, roleMiddleware(['superadmin', 'schooladmin']), async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                throw new BadRequestError('Invalid classroom ID');
            }
            console.log(`Deleting classroom with ID ${req.params.id}...`);
            await classroomManager.deleteClassroom(req.params.id, req.user);
            console.log('Classroom deleted');
            res.status(204).send();
        } catch (error) {
            console.error(`Error deleting classroom with ID ${req.params.id}:`, error.message);
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