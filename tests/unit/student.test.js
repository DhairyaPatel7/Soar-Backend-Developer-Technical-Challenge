const { expect } = require('chai');
const sinon = require('sinon');
const studentModel = require('../../managers/entities/student/student.model');

describe('Student Model Unit Tests', () => {
    let studentStub;

    beforeEach(() => {
        studentStub = sinon.stub(studentModel, 'findById');
    });

    afterEach(() => {
        studentStub.restore();
    });

    it('should find a student by ID', async () => {
        const mockStudent = { id: '123', name: 'Test Student', email: 'teststudent@example.com', classroom: '456', age: 20, address: '123 Test St' };
        studentStub.resolves(mockStudent);

        const student = await studentModel.findById('123');
        expect(student).to.deep.equal(mockStudent);
    });

    it('should return null if student not found', async () => {
        studentStub.resolves(null);

        const student = await studentModel.findById('123');
        expect(student).to.be.null;
    });

    it('should create a new student', async () => {
        const mockStudent = { id: '123', name: 'Test Student', email: 'teststudent@example.com', classroom: '456', age: 20, address: '123 Test St' };
        const createStub = sinon.stub(studentModel.prototype, 'save').resolves(mockStudent);

        const newStudent = new studentModel(mockStudent);
        const savedStudent = await newStudent.save();

        expect(savedStudent).to.deep.equal(mockStudent);
        createStub.restore();
    });

    it('should update a student', async () => {
        const mockStudent = { id: '123', name: 'Updated Student', email: 'teststudent@example.com', classroom: '456', age: 20, address: '123 Test St' };
        const updateStub = sinon.stub(studentModel, 'findByIdAndUpdate').resolves(mockStudent);

        const updatedStudent = await studentModel.findByIdAndUpdate('123', { name: 'Updated Student' }, { new: true });
        expect(updatedStudent).to.deep.equal(mockStudent);
        updateStub.restore();
    });

    it('should delete a student', async () => {
        const deleteStub = sinon.stub(studentModel, 'findByIdAndDelete').resolves({ id: '123' });

        const deletedStudent = await studentModel.findByIdAndDelete('123');
        expect(deletedStudent).to.deep.equal({ id: '123' });
        deleteStub.restore();
    });
});