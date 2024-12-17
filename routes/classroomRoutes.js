const express = require('express');
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
    router.post('', authMiddleware, roleMiddleware(['superadmin', 'schooladmin']), async (req, res) => {
        try {
            console.log('Creating a new classroom...');
            const newClassroom = await classroomManager.createClassroom(req.body, req.user);
            console.log('Classroom created:', newClassroom);
            res.status(201).json(newClassroom);
        } catch (error) {
            console.error('Error creating classroom:', error.message);
            res.status(400).json({ error: error.message });
        }
    });

    // Get all classrooms (restricted to superadmin and schooladmin)
    router.get('', authMiddleware, roleMiddleware(['superadmin', 'schooladmin']), async (req, res) => {
        try {
            console.log('Fetching all classrooms...');
            const classrooms = await classroomManager.getClassrooms(req.user);
            console.log('Classrooms fetched:', classrooms);
            res.status(200).json(classrooms);
        } catch (error) {
            console.error('Error fetching classrooms:', error.message);
            res.status(400).json({ error: error.message });
        }
    });

    // Get classroom by ID (restricted to superadmin and schooladmin)
    router.get('/:id', authMiddleware, roleMiddleware(['superadmin', 'schooladmin']), async (req, res) => {
        try {
            console.log(`Fetching classroom with ID: ${req.params.id}`);
            const classroom = await classroomManager.getClassroomById(req.params.id, req.user);
            console.log('Classroom fetched:', classroom);
            res.status(200).json(classroom);
        } catch (error) {
            console.error(`Error fetching classroom with ID ${req.params.id}:`, error.message);
            res.status(400).json({ error: error.message });
        }
    });

    // Update classroom (restricted to superadmin and schooladmin)
    router.put('/:id', authMiddleware, roleMiddleware(['superadmin', 'schooladmin']), async (req, res) => {
        try {
            console.log(`Updating classroom with ID: ${req.params.id}`);
            const updatedClassroom = await classroomManager.updateClassroom(req.params.id, req.body, req.user);
            console.log('Classroom updated:', updatedClassroom);
            res.status(200).json(updatedClassroom);
        } catch (error) {
            console.error(`Error updating classroom with ID ${req.params.id}:`, error.message);
            res.status(400).json({ error: error.message });
        }
    });

    // Delete classroom (restricted to superadmin and schooladmin)
    router.delete('/:id', authMiddleware, roleMiddleware(['superadmin', 'schooladmin']), async (req, res) => {
        try {
            console.log(`Deleting classroom with ID: ${req.params.id}`);
            await classroomManager.deleteClassroom(req.params.id, req.user);
            console.log('Classroom deleted');
            res.status(204).send();
        } catch (error) {
            console.error(`Error deleting classroom with ID ${req.params.id}:`, error.message);
            res.status(400).json({ error: error.message });
        }
    });

    return router;
};