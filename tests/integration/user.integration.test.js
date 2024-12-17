const request = require('supertest');
const { expect } = require('chai');
const app = require('../../app');
const userModel = require('../../managers/entities/user/user.model'); 

describe('User Entity Integration Tests', () => {
    before(async () => {
        await userModel.deleteMany({});
    });
    let userId;
    let token;

    it('should create a new user', async () => {
        const newUser = {
            username: 'Test User',
            email: 'testuser@example.com',
            password: 'password123',
            role: 'superadmin'
        };

        const res = await request(app)
            .post('/api/users/register')
            .send(newUser);
        
        userId = res.body.user._id;
        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('user');
        expect(res.body.user.username).to.equal(newUser.username);
        expect(res.body.user.email).to.equal(newUser.email);
    });

    it('should authenticate a user', async () => {
        const credentials = {
            email: 'testuser@example.com',
            password: 'password123'
        };

        const res = await request(app)
            .post('/api/users/login')
            .send(credentials);

        token = res.body.token;
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('token');
    });

    it('should return 400 for invalid credentials', async () => {
        const credentials = {
            email: 'testuser@example.com',
            password: 'wrongpassword'
        };

        const res = await request(app)
            .post('/api/users/login')
            .send(credentials);

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property('error');
    });

    it('should update a user', async () => {
        const updatedUser = {
            username: 'Updated User'
        };
        const updateRes = await request(app)
            .put(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updatedUser);

        expect(updateRes.status).to.equal(200);
        expect(updateRes.body.username).to.equal(updatedUser.username);
    });

    it('should delete a user', async () => {
        const deleteRes = await request(app)
            .delete(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${token}`);


        expect(deleteRes.status).to.equal(204);
    });
});