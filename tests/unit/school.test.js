const { expect } = require('chai');
const sinon = require('sinon');
const schoolModel = require('../../managers/entities/school/school.model');

describe('School Model Unit Tests', () => {
    let schoolStub;

    beforeEach(() => {
        schoolStub = sinon.stub(schoolModel, 'findById');
    });

    afterEach(() => {
        schoolStub.restore();
    });

    it('should find a school by ID', async () => {
        const mockSchool = { id: '123', name: 'Test School' };
        schoolStub.resolves(mockSchool);

        const school = await schoolModel.findById('123');
        expect(school).to.deep.equal(mockSchool);
    });

    it('should return null if school not found', async () => {
        schoolStub.resolves(null);

        const school = await schoolModel.findById('123');
        expect(school).to.be.null;
    });

    it('should create a new school', async () => {
        const mockSchool = { id: '123', name: 'Test School' };
        const createStub = sinon.stub(schoolModel.prototype, 'save').resolves(mockSchool);

        const newSchool = new schoolModel(mockSchool);
        const savedSchool = await newSchool.save();

        expect(savedSchool).to.deep.equal(mockSchool);
        createStub.restore();
    });

    it('should update a school', async () => {
        const mockSchool = { id: '123', name: 'Updated School' };
        const updateStub = sinon.stub(schoolModel, 'findByIdAndUpdate').resolves(mockSchool);

        const updatedSchool = await schoolModel.findByIdAndUpdate('123', { name: 'Updated School' }, { new: true });
        expect(updatedSchool).to.deep.equal(mockSchool);
        updateStub.restore();
    });

    it('should delete a school', async () => {
        const deleteStub = sinon.stub(schoolModel, 'findByIdAndDelete').resolves({ id: '123' });

        const deletedSchool = await schoolModel.findByIdAndDelete('123');
        expect(deletedSchool).to.deep.equal({ id: '123' });
        deleteStub.restore();
    });
});