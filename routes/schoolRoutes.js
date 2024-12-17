const express = require('express');
const router = express.Router();
const authMiddleware = require('../mws/auth.middleware');
const roleMiddleware = require('../mws/role.middleware');

module.exports = (schoolManager) => {
    // Middleware to log request details
    router.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        console.log('Request Body:', req.body);
        next();
    });

    // Create a new school (restricted to superadmin)
    router.post('', authMiddleware, roleMiddleware(['superadmin']), async (req, res) => {
        try {
            console.log('Creating a new school...');
            const newSchool = await schoolManager.createSchool(req.body);
            console.log('School created:', newSchool);
            res.status(201).json(newSchool);
        } catch (error) {
            console.error('Error creating school:', error.message);
            res.status(400).json({ error: error.message });
        }
    });

    // Get all schools (restricted to superadmin)
    router.get('', authMiddleware, roleMiddleware(['superadmin']), async (req, res) => {
        try {
            console.log('Fetching all schools...');
            const schools = await schoolManager.getSchools();
            console.log('Schools fetched:', schools);
            res.status(200).json(schools);
        } catch (error) {
            console.error('Error fetching schools:', error.message);
            res.status(400).json({ error: error.message });
        }
    });

    // Get school by ID (restricted to superadmin)
    router.get('/:id', authMiddleware, roleMiddleware(['superadmin']), async (req, res) => {
        try {
            console.log(`Fetching school with ID: ${req.params.id}`);
            const school = await schoolManager.getSchoolById(req.params.id);
            console.log('School fetched:', school);
            res.status(200).json(school);
        } catch (error) {
            console.error(`Error fetching school with ID ${req.params.id}:`, error.message);
            res.status(400).json({ error: error.message });
        }
    });

    // Update school (restricted to superadmin)
    router.put('/:id', authMiddleware, roleMiddleware(['superadmin']), async (req, res) => {
        try {
            console.log(`Updating school with ID: ${req.params.id}`);
            const updatedSchool = await schoolManager.updateSchool(req.params.id, req.body);
            console.log('School updated:', updatedSchool);
            res.status(200).json(updatedSchool);
        } catch (error) {
            console.error(`Error updating school with ID ${req.params.id}:`, error.message);
            res.status(400).json({ error: error.message });
        }
    });

    // Delete school (restricted to superadmin)
    router.delete('/:id', authMiddleware, roleMiddleware(['superadmin']), async (req, res) => {
        try {
            console.log(`Deleting school with ID: ${req.params.id}`);
            await schoolManager.deleteSchool(req.params.id);
            console.log('School deleted');
            res.status(204).send();
        } catch (error) {
            console.error(`Error deleting school with ID ${req.params.id}:`, error.message);
            res.status(400).json({ error: error.message });
        }
    });

    return router;
};