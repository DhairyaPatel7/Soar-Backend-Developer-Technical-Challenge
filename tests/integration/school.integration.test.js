const request = require('supertest');
const { expect } = require('chai');
const app = require('../../app');
const schoolModel = require('../../managers/entities/school/school.model'); // Adjust the path as necessary
const userModel = require('../../managers/entities/user/user.model'); // Adjust the path as necessary

describe('School Entity Integration Tests', () => {
    let userId;
    let token;
    let schoolId;

    before(async () => {
        // Clear the users and schools collections before each test
        await userModel.deleteMany({});
        await schoolModel.deleteMany({});

        // Create a superadmin user
        const newUser = {
            username: 'Super Admin',
            email: 'superadmin@example.com',
            password: 'password123',
            role: 'superadmin'
        };

        const res = await request(app)
            .post('/api/users/register')
            .send(newUser);

        userId = res.body.user._id;

        // Authenticate the superadmin user
        const credentials = {
            email: 'superadmin@example.com',
            password: 'password123'
        };

        const authRes = await request(app)
            .post('/api/users/login')
            .send(credentials);

        token = authRes.body.token;
    });

    it('should create a new school', async () => {
        const newSchool = {
            name: 'Test School',
            address: '123 Test St',
            phone: '123-456-7890',
            email: 'testschool@example.com',
            website: 'http://testschool.com',
            established: '2000-01-01',
            admin: userId
        };

        const res = await request(app)
            .post('/api/schools')
            .set('Authorization', `Bearer ${token}`)
            .send(newSchool);

        schoolId = res.body._id;
        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('_id');
        expect(res.body.name).to.equal(newSchool.name);
        expect(res.body.address).to.equal(newSchool.address);
        expect(res.body.phone).to.equal(newSchool.phone);
        expect(res.body.email).to.equal(newSchool.email);
        expect(res.body.adminId).to.equal(newSchool.adminId);
    });

    it('should get a school by ID', async () => {
        const newSchool = {
            name: 'Test School',
            address: '123 Test St',
            phone: '123-456-7890',
            email: 'testschool@example.com',
            website: 'http://testschool.com',
            established: '2000-01-01',
            admin: userId
        };

        // Get the school by ID
        const getRes = await request(app)
            .get(`/api/schools/${schoolId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(getRes.status).to.equal(200);
        expect(getRes.body.name).to.equal(newSchool.name);
        expect(getRes.body.address).to.equal(newSchool.address);
        expect(getRes.body.phone).to.equal(newSchool.phone);
        expect(getRes.body.email).to.equal(newSchool.email);
        expect(getRes.body.admin._id).to.equal(userId);
    });

    it('should update a school', async () => {
        // Update the school's name
        const updatedSchool = {
            name: 'Updated School'
        };

        const updateRes = await request(app)
            .put(`/api/schools/${schoolId}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updatedSchool);

        expect(updateRes.status).to.equal(200);
        expect(updateRes.body.name).to.equal(updatedSchool.name);
    });

    it('should delete a school', async () => {
        // Delete the school
        const deleteRes = await request(app)
            .delete(`/api/schools/${schoolId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(deleteRes.status).to.equal(204);
    });

    it('should get all schools', async () => {
        // Create multiple schools
        const schools = [
            {
                name: 'School One',
                address: 'Address One',
                phone: '111-111-1111',
                email: 'schoolone@example.com',
                website: 'http://schoolone.com',
                established: '1990-01-01',
                admin: userId
            },
            {
                name: 'School Two',
                address: 'Address Two',
                phone: '222-222-2222',
                email: 'schooltwo@example.com',
                website: 'http://schooltwo.com',
                established: '1995-01-01',
                admin: userId
            }
        ];

        for (const school of schools) {
            await request(app)
                .post('/api/schools')
                .set('Authorization', `Bearer ${token}`)
                .send(school);
        }

        // Get all schools
        const getAllRes = await request(app)
            .get('/api/schools')
            .set('Authorization', `Bearer ${token}`);

        expect(getAllRes.status).to.equal(200);
        expect(getAllRes.body).to.be.an('array');
        expect(getAllRes.body.length).to.be.greaterThan(1);
    });
});