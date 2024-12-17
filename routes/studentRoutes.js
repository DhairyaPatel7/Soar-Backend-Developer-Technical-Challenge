const express = require('express');
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
    router.post('', authMiddleware, roleMiddleware(['superadmin', 'schooladmin']), async (req, res) => {
        try {
            console.log('Creating a new student...');
            const newStudent = await studentManager.createStudent(req.body, req.user);
            console.log('Student created:', newStudent);
            res.status(201).json(newStudent);
        } catch (error) {
            console.error('Error creating student:', error.message);
            res.status(400).json({ error: error.message });
        }
    });

    // Get all students (restricted to superadmin and schooladmin)
    router.get('', authMiddleware, roleMiddleware(['superadmin', 'schooladmin']), async (req, res) => {
        try {
            console.log('Fetching all students...');
            const students = await studentManager.getStudents(req.user);
            console.log('Students fetched:', students);
            res.status(200).json(students);
        } catch (error) {
            console.error('Error fetching students:', error.message);
            res.status(400).json({ error: error.message });
        }
    });

    // Get students by classroom ID (restricted to superadmin and schooladmin)
    router.get('/classrooms/:classroomId', authMiddleware, roleMiddleware(['superadmin', 'schooladmin']), async (req, res) => {
        try {
            console.log(`Fetching students for classroom ID: ${req.params.classroomId}`);
            const students = await studentManager.getStudentsByClassroom(req.params.classroomId, req.user);
            console.log('Students fetched:', students);
            res.status(200).json(students);
        } catch (error) {
            console.error(`Error fetching students for classroom ID ${req.params.classroomId}:`, error.message);
            res.status(400).json({ error: error.message });
        }
    });

    // Get student by ID (restricted to superadmin and schooladmin)
    router.get('/:id', authMiddleware, roleMiddleware(['superadmin', 'schooladmin']), async (req, res) => {
        try {
            console.log(`Fetching student with ID: ${req.params.id}`);
            const student = await studentManager.getStudentById(req.params.id, req.user);
            console.log('Student fetched:', student);
            res.status(200).json(student);
        } catch (error) {
            console.error(`Error fetching student with ID ${req.params.id}:`, error.message);
            res.status(400).json({ error: error.message });
        }
    });

    // Update student (restricted to superadmin and schooladmin)
    router.put('/:id', authMiddleware, roleMiddleware(['superadmin', 'schooladmin']), async (req, res) => {
        try {
            console.log(`Updating student with ID: ${req.params.id}`);
            const updatedStudent = await studentManager.updateStudent(req.params.id, req.body, req.user);
            console.log('Student updated:', updatedStudent);
            res.status(200).json(updatedStudent);
        } catch (error) {
            console.error(`Error updating student with ID ${req.params.id}:`, error.message);
            res.status(400).json({ error: error.message });
        }
    });

    // Delete student (restricted to superadmin and schooladmin)
    router.delete('/:id', authMiddleware, roleMiddleware(['superadmin', 'schooladmin']), async (req, res) => {
        try {
            console.log(`Deleting student with ID: ${req.params.id}`);
            await studentManager.deleteStudent(req.params.id, req.user);
            console.log('Student deleted');
            res.status(204).send();
        } catch (error) {
            console.error(`Error deleting student with ID ${req.params.id}:`, error.message);
            res.status(400).json({ error: error.message });
        }
    });

    return router;
};