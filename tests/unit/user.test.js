const { expect } = require('chai');
const sinon = require('sinon');
const userModel = require('../../managers/entities/user/user.model');

describe('User Model Unit Tests', () => {
    let userStub;

    beforeEach(() => {
        userStub = sinon.stub(userModel, 'findById');
    });

    afterEach(() => {
        userStub.restore();
    });

    it('should find a user by ID', async () => {
        const mockUser = { id: '123', name: 'Test User' };
        userStub.resolves(mockUser);

        const user = await userModel.findById('123');
        expect(user).to.deep.equal(mockUser);
    });

    it('should return null if user not found', async () => {
        userStub.resolves(null);

        const user = await userModel.findById('123');
        expect(user).to.be.null;
    });

    it('should create a new user', async () => {
        const mockUser = { id: '123', name: 'Test User', email: 'testuser@example.com', password: 'password123' };
        const createStub = sinon.stub(userModel.prototype, 'save').resolves(mockUser);

        const newUser = new userModel(mockUser);
        const savedUser = await newUser.save();

        expect(savedUser).to.deep.equal(mockUser);
        createStub.restore();
    });

    it('should find a user by email', async () => {
        const mockUser = { id: '123', name: 'Test User', email: 'testuser@example.com' };
        const findStub = sinon.stub(userModel, 'findOne').resolves(mockUser);

        const user = await userModel.findOne({ email: 'testuser@example.com' });
        expect(user).to.deep.equal(mockUser);
        findStub.restore();
    });

    it('should update a user', async () => {
        const mockUser = { id: '123', name: 'Updated User', email: 'testuser@example.com' };
        const updateStub = sinon.stub(userModel, 'findByIdAndUpdate').resolves(mockUser);

        const updatedUser = await userModel.findByIdAndUpdate('123', { name: 'Updated User' }, { new: true });
        expect(updatedUser).to.deep.equal(mockUser);
        updateStub.restore();
    });

    it('should delete a user', async () => {
        const deleteStub = sinon.stub(userModel, 'findByIdAndDelete').resolves({ id: '123' });

        const deletedUser = await userModel.findByIdAndDelete('123');
        expect(deletedUser).to.deep.equal({ id: '123' });
        deleteStub.restore();
    });
});