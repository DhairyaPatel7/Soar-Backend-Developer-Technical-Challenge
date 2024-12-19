const express = require('express');
const mongoose = require('mongoose');
const { NotFoundError, AccessDeniedError, BadRequestError } = require('../error/error');

const router = express.Router();
const authMiddleware = require('../mws/auth.middleware');
const roleMiddleware = require('../mws/role.middleware');

module.exports = (studentManager) => {
    // Middleware to log request details
    router.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        console.log('Request Body:', req.body);
        next();
    });

    // Create a new student (restricted to superadmin and schooladmin)
    router.post('', authMiddleware, roleMiddleware(['superadmin', 'schooladmin']), async (req, res, next) => {
        try {
            console.log('Creating a new student...');
            const newStudent = await studentManager.createStudent(req.body, req.user);
            console.log('Student created:', newStudent);
            res.status(201).json(newStudent);
        } catch (error) {
            console.error('Error creating student:', error.message);
            next(error);
        }
    });

    // Get all students (restricted to superadmin and schooladmin)
    router.get('', authMiddleware, roleMiddleware(['superadmin', 'schooladmin']), async (req, res, next) => {
        try {
            console.log('Fetching all students...');
            const students = await studentManager.getStudents(req.user);
            console.log('Students fetched:', students);
            res.status(200).json(students);
        } catch (error) {
            console.error('Error fetching students:', error.message);
            next(error);
        }
    });

    // Get students by classroom ID (restricted to superadmin and schooladmin)
    router.get('/classrooms/:classroomId', authMiddleware, roleMiddleware(['superadmin', 'schooladmin']), async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.classroomId)) {
                throw new BadRequestError('Invalid classroom ID');
            }
            console.log(`Fetching students for classroom ID ${req.params.classroomId}...`);
            const students = await studentManager.getStudentsByClassroom(req.params.classroomId, req.user);
            console.log('Students fetched:', students);
            res.status(200).json(students);
        } catch (error) {
            console.error('Error fetching students by classroom ID:', error.message);
            next(error);
        }
    });

    // Get a student by ID (restricted to superadmin and schooladmin)
    router.get('/:id', authMiddleware, roleMiddleware(['superadmin', 'schooladmin']), async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                throw new BadRequestError('Invalid student ID');
            }
            console.log(`Fetching student with ID ${req.params.id}...`);
            const student = await studentManager.getStudentById(req.params.id, req.user);
            console.log('Student fetched:', student);
            res.status(200).json(student);
        } catch (error) {
            console.error('Error fetching student:', error.message);
            next(error);
        }
    });

    // Update a student (restricted to superadmin and schooladmin)
    router.put('/:id', authMiddleware, roleMiddleware(['superadmin', 'schooladmin']), async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                throw new BadRequestError('Invalid student ID');
            }
            console.log(`Updating student with ID ${req.params.id}...`);
            const student = await studentManager.updateStudent(req.params.id, req.body, req.user);
            console.log('Student updated:', student);
            res.status(200).json(student);
        } catch (error) {
            console.error('Error updating student:', error.message);
            next(error);
        }
    });

    // Delete a student (restricted to superadmin and schooladmin)
    router.delete('/:id', authMiddleware, roleMiddleware(['superadmin', 'schooladmin']), async (req, res, next) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                throw new BadRequestError('Invalid student ID');
            }
            console.log(`Deleting student with ID ${req.params.id}...`);
            await studentManager.deleteStudent(req.params.id, req.user);
            console.log('Student deleted');
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting student:', error.message);
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