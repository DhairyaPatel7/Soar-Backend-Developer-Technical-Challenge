const request = require('supertest');
const { expect } = require('chai');
const app = require('../../app');
const classroomModel = require('../../managers/entities/classroom/classroom.model'); 
const schoolModel = require('../../managers/entities/school/school.model'); 
const userModel = require('../../managers/entities/user/user.model'); 

describe('Classroom Entity Integration Tests', () => {
    let superadminId;
    let superadminToken;
    let schooladminId;
    let schooladminToken;
    let schoolId;
    let classroomId;

    before(async () => {
        // Clear the users, schools, and classrooms collections before each test
        await userModel.deleteMany({});
        await schoolModel.deleteMany({});
        await classroomModel.deleteMany({});

        // Create a superadmin user
        const newSuperadmin = {
            username: 'Super Admin',
            email: 'superadmin@example.com',
            password: 'password123',
            role: 'superadmin'
        };

        const superadminRes = await request(app)
            .post('/api/users/register')
            .send(newSuperadmin);

        superadminId = superadminRes.body.user._id;

        // Authenticate the superadmin user
        const superadminCredentials = {
            email: 'superadmin@example.com',
            password: 'password123'
        };

        const superadminAuthRes = await request(app)
            .post('/api/users/login')
            .send(superadminCredentials);

        superadminToken = superadminAuthRes.body.token;

        // Create a schooladmin user
        const newSchooladmin = {
            username: 'School Admin',
            email: 'schooladmin@example.com',
            password: 'password123',
            role: 'schooladmin'
        };

        const schooladminRes = await request(app)
            .post('/api/users/register')
            .send(newSchooladmin);

        schooladminId = schooladminRes.body.user._id;

        // Authenticate the schooladmin user
        const schooladminCredentials = {
            email: 'schooladmin@example.com',
            password: 'password123'
        };

        const schooladminAuthRes = await request(app)
            .post('/api/users/login')
            .send(schooladminCredentials);

        schooladminToken = schooladminAuthRes.body.token;

        // Create a school with the token of superadmin
        const newSchool = {
            name: 'Test School',
            address: '123 Test St',
            phone: '123-456-7890',
            email: 'testschool@example.com',
            website: 'http://testschool.com',
            established: '2000-01-01',
            admin: superadminId
        };

        const schoolRes = await request(app)
            .post('/api/schools')
            .set('Authorization', `Bearer ${superadminToken}`)
            .send(newSchool);
        
        schoolId = schoolRes.body._id;
    });

    after(async () => {
        // Clear the users, schools, and classrooms collections after all tests
        await userModel.deleteMany({});
        await schoolModel.deleteMany({});
        await classroomModel.deleteMany({});
    });

    it('should fail to create a classroom with schooladmin user without school', async () => {
        const newClassroom = {
            name: 'Test Classroom',
            school: schoolId,
            capacity: 30,
            resources: ['Projector', 'Whiteboard']
        };

        const res = await request(app)
            .post('/api/classrooms')
            .set('Authorization', `Bearer ${schooladminToken}`)
            .send(newClassroom);

        expect(res.status).to.equal(400); 
    });

    it('should update schooladmin user to add school', async () => {
        const updatedSchooladmin = {
            school: schoolId
        };

        const updateRes = await request(app)
            .put(`/api/users/${schooladminId}`)
            .set('Authorization', `Bearer ${superadminToken}`)
            .send(updatedSchooladmin);

        expect(updateRes.status).to.equal(200);
        expect(updateRes.body.school).to.equal(schoolId);
    });

    it('should create a new classroom with schooladmin user', async () => {
        const newClassroom = {
            name: 'Test Classroom',
            school: schoolId,
            capacity: 30,
            resources: ['Projector', 'Whiteboard']
        };

        const res = await request(app)
            .post('/api/classrooms')
            .set('Authorization', `Bearer ${schooladminToken}`)
            .send(newClassroom);

        classroomId = res.body._id;
        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('_id');
        expect(res.body.name).to.equal(newClassroom.name);
        expect(res.body.school).to.equal(newClassroom.school);
        expect(res.body.capacity).to.equal(newClassroom.capacity);
        expect(res.body.resources).to.deep.equal(newClassroom.resources);
    });

    it('should update a classroom capacity', async () => {
        const updatedClassroom = {
            capacity: 35
        };

        const updateRes = await request(app)
            .put(`/api/classrooms/${classroomId}`)
            .set('Authorization', `Bearer ${schooladminToken}`)
            .send(updatedClassroom);

        expect(updateRes.status).to.equal(200);
        expect(updateRes.body.capacity).to.equal(updatedClassroom.capacity);
    });

    it('should get a classroom by ID', async () => {
        const getRes = await request(app)
            .get(`/api/classrooms/${classroomId}`)
            .set('Authorization', `Bearer ${schooladminToken}`);

        expect(getRes.status).to.equal(200);
        expect(getRes.body.name).to.equal('Test Classroom');
        expect(getRes.body.school._id).to.equal(schoolId);
        expect(getRes.body.capacity).to.equal(35);
        expect(getRes.body.resources).to.deep.equal(['Projector', 'Whiteboard']);
    });

    it('should delete a classroom', async () => {
        const deleteRes = await request(app)
            .delete(`/api/classrooms/${classroomId}`)
            .set('Authorization', `Bearer ${schooladminToken}`);

        expect(deleteRes.status).to.equal(204);
    });

    it('should get all classrooms', async () => {
        const newClassroom1 = {
            name: 'Classroom A',
            school: schoolId,
            capacity: 25,
            resources: ['Chairs', 'Desks']
        };

        const newClassroom2 = {
            name: 'Classroom B',
            school: schoolId,
            capacity: 40,
            resources: ['Computers', 'Projector']
        };

        await request(app)
            .post('/api/classrooms')
            .set('Authorization', `Bearer ${schooladminToken}`)
            .send(newClassroom1);

        await request(app)
            .post('/api/classrooms')
            .set('Authorization', `Bearer ${schooladminToken}`)
            .send(newClassroom2);

        const getAllRes = await request(app)
            .get('/api/classrooms')
            .set('Authorization', `Bearer ${schooladminToken}`);

        expect(getAllRes.status).to.equal(200);
        expect(getAllRes.body).to.be.an('array');
        expect(getAllRes.body.length).to.be.at.least(2);
        const classroomNames = getAllRes.body.map((classroom) => classroom.name);
        expect(classroomNames).to.include('Classroom A');
        expect(classroomNames).to.include('Classroom B');
    });

    it('should fail to create a classroom with invalid school', async () => {
        const invalidSchoolId = '605c72ef1532074b4c20d1a1'; 
        const newClassroom = {
            name: 'Test Classroom',
            school: invalidSchoolId, 
            capacity: 30,
            resources: ['Projector', 'Whiteboard']
        };
    
        const res = await request(app)
            .put('/api/classrooms')
            .set('Authorization', `Bearer ${schooladminToken}`)
            .send(newClassroom);
    
        expect(res.status).to.equal(404); 
    });

    it('should fail to get a deleted classroom by ID', async () => {
        const getRes = await request(app)
            .get(`/api/classrooms/${classroomId}`)
            .set('Authorization', `Bearer ${schooladminToken}`);

        expect(getRes.status).to.equal(400);
    });
    
});