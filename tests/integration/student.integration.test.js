const request = require('supertest');
const { expect } = require('chai');
const app = require('../../app');
const studentModel = require('../../managers/entities/student/student.model');
const classroomModel = require('../../managers/entities/classroom/classroom.model'); 
const schoolModel = require('../../managers/entities/school/school.model'); 
const userModel = require('../../managers/entities/user/user.model'); 

describe('Student Entity Integration Tests', () => {
    let superadminId;
    let superadminToken;
    let schooladminId;
    let schooladminToken;
    let schoolId;
    let classroomId;
    let studentId;

    before(async () => {
        // Clear the users, schools, classrooms, and students collections before each test
        await userModel.deleteMany({});
        await schoolModel.deleteMany({});
        await classroomModel.deleteMany({});
        await studentModel.deleteMany({});

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

        // Update schooladmin user to assign this school to this user
        const updatedSchooladmin = {
            school: schoolId
        };

        const updateSchooladminRes = await request(app)
            .put(`/api/users/${schooladminId}`)
            .set('Authorization', `Bearer ${superadminToken}`)
            .send(updatedSchooladmin);

        expect(updateSchooladminRes.status).to.equal(200);
        expect(updateSchooladminRes.body.school).to.equal(schoolId);

        // Create a classroom with schooladmin user with capacity as 1
        const newClassroom = {
            name: 'Test Classroom',
            school: schoolId,
            capacity: 1,
            resources: ['Projector', 'Whiteboard']
        };

        const classroomRes = await request(app)
            .post('/api/classrooms')
            .set('Authorization', `Bearer ${schooladminToken}`)
            .send(newClassroom);

        classroomId = classroomRes.body._id;
    });

    after(async () => {
        // Clear the users, schools, classrooms, and students collections after all tests
        await userModel.deleteMany({});
        await schoolModel.deleteMany({});
        await classroomModel.deleteMany({});
        await studentModel.deleteMany({});
    });

    it('should fail to update a student with an invalid classroom', async () => {
        const updatedStudent = {
            classroom: 'invalidClassroomId'
        };

        const updateRes = await request(app)
            .put(`/api/students/${studentId}`)
            .set('Authorization', `Bearer ${schooladminToken}`)
            .send(updatedStudent);

        expect(updateRes.status).to.equal(400);
    });

    it('should fail to update a student with access denied', async () => {
        const newSchool = {
            name: 'Another Test School',
            address: '456 Another St',
            phone: '987-654-3210',
            email: 'anothertestschool@example.com',
            website: 'http://anothertestschool.com',
            established: '2005-01-01',
            admin: superadminId
        };

        const schoolRes = await request(app)
            .post('/api/schools')
            .set('Authorization', `Bearer ${superadminToken}`)
            .send(newSchool);

        const anotherSchoolId = schoolRes.body._id;

        const newClassroom = {
            name: 'Another Test Classroom',
            school: anotherSchoolId,
            capacity: 30,
            resources: ['Projector', 'Whiteboard']
        };

        const classroomRes = await request(app)
            .post('/api/classrooms')
            .set('Authorization', `Bearer ${superadminToken}`)
            .send(newClassroom);

        const anotherClassroomId = classroomRes.body._id;

        const updatedStudent = {
            classroom: anotherClassroomId
        };

        const updateRes = await request(app)
            .put(`/api/students/${studentId}`)
            .set('Authorization', `Bearer ${schooladminToken}`)
            .send(updatedStudent);

        expect(updateRes.status).to.equal(400);
    });


    it('should fail to update a student when classroom capacity is exceeded', async () => {
        // Create a classroom with capacity 1
        const newClassroom = {
            name: 'Small Classroom',
            school: schoolId,
            capacity: 1,
            resources: ['Projector']
        };

        const classroomRes = await request(app)
            .post('/api/classrooms')
            .set('Authorization', `Bearer ${schooladminToken}`)
            .send(newClassroom);

        const smallClassroomId = classroomRes.body._id;

        // Create a student in the small classroom
        const newStudent = {
            name: 'Another Student',
            age: 16,
            classroom: smallClassroomId
        };

        await request(app)
            .post('/api/students')
            .set('Authorization', `Bearer ${schooladminToken}`)
            .send(newStudent);

        // Try to update the original student to the small classroom
        const updatedStudent = {
            classroom: smallClassroomId
        };

        const updateRes = await request(app)
            .put(`/api/students/${studentId}`)
            .set('Authorization', `Bearer ${schooladminToken}`)
            .send(updatedStudent);

        expect(updateRes.status).to.equal(400);
    });

    it('should create a student and assign it to the classroom', async () => {
        const newStudent = {
            name: 'Test Student',
            email: 'teststudent@example.com',
            classroom: classroomId,
            age: 20,
            address: '123 Test St'
        };

        const res = await request(app)
            .post('/api/students')
            .set('Authorization', `Bearer ${schooladminToken}`)
            .send(newStudent);

        studentId = res.body._id;
        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('_id');
        expect(res.body.name).to.equal(newStudent.name);
        expect(res.body.email).to.equal(newStudent.email);
        expect(res.body.classroom).to.equal(newStudent.classroom);
        expect(res.body.age).to.equal(newStudent.age);
        expect(res.body.address).to.equal(newStudent.address);
    });

    it('should fail to create another student in the same classroom due to capacity', async () => {
        const newStudent = {
            name: 'Another Student',
            email: 'anotherstudent@example.com',
            classroom: classroomId,
            age: 20,
            address: '123 Test St'
        };

        const res = await request(app)
            .post('/api/students')
            .set('Authorization', `Bearer ${schooladminToken}`)
            .send(newStudent);

        expect(res.status).to.equal(400); 
    });

    it('should update classroom capacity to 30', async () => {
        const updatedClassroom = {
            capacity: 30
        };

        const updateRes = await request(app)
            .put(`/api/classrooms/${classroomId}`)
            .set('Authorization', `Bearer ${schooladminToken}`)
            .send(updatedClassroom);

        expect(updateRes.status).to.equal(200);
        expect(updateRes.body.capacity).to.equal(updatedClassroom.capacity);
    });

    it('should create another student and assign it to the classroom successfully', async () => {
        const newStudent = {
            name: 'Another Student',
            email: 'anotherstudent@example.com',
            classroom: classroomId,
            age: 20,
            address: '123 Test St'
        };

        const res = await request(app)
            .post('/api/students')
            .set('Authorization', `Bearer ${schooladminToken}`)
            .send(newStudent);

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('_id');
        expect(res.body.name).to.equal(newStudent.name);
        expect(res.body.email).to.equal(newStudent.email);
        expect(res.body.classroom).to.equal(newStudent.classroom);
        expect(res.body.age).to.equal(newStudent.age);
        expect(res.body.address).to.equal(newStudent.address);
    });

    it('should update a student information', async () => {
        const updatedStudent = {
            name: 'Updated Student'
        };

        const updateRes = await request(app)
            .put(`/api/students/${studentId}`)
            .set('Authorization', `Bearer ${schooladminToken}`)
            .send(updatedStudent);

        expect(updateRes.status).to.equal(200);
        expect(updateRes.body.name).to.equal(updatedStudent.name);
    });

    it('should get a student by ID', async () => {
        const getRes = await request(app)
            .get(`/api/students/${studentId}`)
            .set('Authorization', `Bearer ${schooladminToken}`);

        expect(getRes.status).to.equal(200);
        expect(getRes.body.name).to.equal('Updated Student');
        expect(getRes.body.email).to.equal('teststudent@example.com');
        expect(getRes.body.classroom._id).to.equal(classroomId);
        expect(getRes.body.age).to.equal(20);
        expect(getRes.body.address).to.equal('123 Test St');
    });

    it('should get students by classroom', async () => {
        const getRes = await request(app)
            .get(`/api/students/classrooms/${classroomId}`)
            .set('Authorization', `Bearer ${schooladminToken}`);

        expect(getRes.status).to.equal(200);
        expect(getRes.body).to.be.an('array');
        expect(getRes.body.length).to.be.at.least(1);
        expect(getRes.body[0].classroom._id).to.equal(classroomId);
    });

    it('should get all students', async () => {
        const getRes = await request(app)
            .get('/api/students')
            .set('Authorization', `Bearer ${schooladminToken}`);
    
        expect(getRes.status).to.equal(200);
        expect(getRes.body).to.be.an('array');
        expect(getRes.body.length).to.be.at.least(1); 
        expect(getRes.body[0]).to.have.property('_id');
        expect(getRes.body[0]).to.have.property('name');
        expect(getRes.body[0]).to.have.property('email');
        expect(getRes.body[0].classroom._id).to.equal(classroomId);
    });

    it('should delete a student', async () => {
        const deleteRes = await request(app)
            .delete(`/api/students/${studentId}`)
            .set('Authorization', `Bearer ${schooladminToken}`);

        expect(deleteRes.status).to.equal(204);
    });


});