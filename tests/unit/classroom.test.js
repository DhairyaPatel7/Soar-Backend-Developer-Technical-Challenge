const { expect } = require('chai');
const sinon = require('sinon');
const classroomModel = require('../../managers/entities/classroom/classroom.model');
const ClassroomManager = require('../../managers/entities/classroom/Classroom.manager');

describe('Classroom Model Unit Tests', () => {
    let classroomStub;

    beforeEach(() => {
        classroomStub = sinon.stub(classroomModel, 'findById');
    });

    afterEach(() => {
        classroomStub.restore();
    });

    it('should find a classroom by ID', async () => {
        const mockClassroom = { id: '123', name: 'Test Classroom', school: '456', capacity: 30, resources: ['Projector', 'Whiteboard'] };
        classroomStub.resolves(mockClassroom);

        const classroom = await classroomModel.findById('123');
        expect(classroom).to.deep.equal(mockClassroom);
    });

    it('should return null if classroom not found', async () => {
        classroomStub.resolves(null);

        const classroom = await classroomModel.findById('123');
        expect(classroom).to.be.null;
    });

    it('should create a new classroom', async () => {
        const mockClassroom = { id: '123', name: 'Test Classroom', school: '456', capacity: 30, resources: ['Projector', 'Whiteboard'] };
        const createStub = sinon.stub(classroomModel.prototype, 'save').resolves(mockClassroom);

        const newClassroom = new classroomModel(mockClassroom);
        const savedClassroom = await newClassroom.save();

        expect(savedClassroom).to.deep.equal(mockClassroom);
        createStub.restore();
    });

    it('should update a classroom', async () => {
        const mockClassroom = { id: '123', name: 'Updated Classroom', school: '456', capacity: 30, resources: ['Projector', 'Whiteboard'] };
        const updateStub = sinon.stub(classroomModel, 'findByIdAndUpdate').resolves(mockClassroom);

        const updatedClassroom = await classroomModel.findByIdAndUpdate('123', { name: 'Updated Classroom' }, { new: true });
        expect(updatedClassroom).to.deep.equal(mockClassroom);
        updateStub.restore();
    });

    it('should delete a classroom', async () => {
        const deleteStub = sinon.stub(classroomModel, 'findByIdAndDelete').resolves({ id: '123' });

        const deletedClassroom = await classroomModel.findByIdAndDelete('123');
        expect(deletedClassroom).to.deep.equal({ id: '123' });
        deleteStub.restore();
    });


    it('should get all classrooms', async () => {
        classroomStub = sinon.stub(classroomModel, 'find');
        const mockClassrooms = [
            { id: '123', name: 'Classroom 1', school: '456', capacity: 30, resources: ['Projector', 'Whiteboard'] },
            { id: '124', name: 'Classroom 2', school: '456', capacity: 25, resources: ['Projector'] }
        ];
        classroomStub.resolves(mockClassrooms);

        const classrooms = await classroomModel.find();
        expect(classrooms).to.deep.equal(mockClassrooms);
    });
    

});