const { NotFoundError, AccessDeniedError, BadRequestError } = require('../../../error/error');
const mongoose = require('mongoose');

module.exports = class ClassroomManager {
    constructor({ mongomodels, validators }) {
        this.Classroom = mongomodels.classroom;
        this.School = mongomodels.school;
        this.User = mongomodels.user;
        this.validators = validators.classroom;
    }

    async createClassroom(data, user) {
        const validation = this.validators.create.validate(data);
        if (validation.error) {
            throw new BadRequestError(validation.error.details[0].message);
        }

        if (!mongoose.Types.ObjectId.isValid(data.school)) {
            throw new BadRequestError('Invalid School');
        }

        const school = await this.School.findById(data.school);
        if (!school) {
            throw new NotFoundError('Invalid school');
        }

        if (user.role !== 'superadmin' && !school._id.equals(user.school)) {
            throw new AccessDeniedError('Access denied: You do not belong to the same school');
        }

        const classroom = new this.Classroom(data);
        await classroom.save();
        return classroom;
    }

    async getClassrooms(user) {
        if (user.role === 'superadmin') {
            return await this.Classroom.find().populate('school');
        } else if (user.role === 'schooladmin') {
            return await this.Classroom.find({ school: user.school }).populate('school');
        } else {
            throw new AccessDeniedError('Access denied');
        }
    }

    async getClassroomById(id, user) {
        const classroom = await this.Classroom.findById(id).populate('school');
        if (!classroom) {
            throw new NotFoundError('Classroom not found');
        }

        if (user.role !== 'superadmin' && !classroom.school.equals(user.school)) {
            throw new AccessDeniedError('Access denied: You do not belong to the same school');
        }

        return classroom;
    }

    async updateClassroom(id, data, user) {
        const validation = this.validators.update.validate(data);
        if (validation.error) {
            throw new BadRequestError(validation.error.details[0].message);
        }

        const classroom = await this.Classroom.findById(id).populate('school');
        if (!classroom) {
            throw new NotFoundError('Classroom not found');
        }

        if (user.role !== 'superadmin' && !classroom.school.equals(user.school)) {
            throw new AccessDeniedError('Access denied: You do not belong to the same school');
        }

        if (data.school && !mongoose.Types.ObjectId.isValid(data.school)) {
            throw new BadRequestError('Invalid School');
        }
        if (data.school && data.school !== classroom.school._id.toString()) {
            const school = await this.School.findById(data.school);
            if (!school) {
                throw new NotFoundError('Invalid school');
            }

            if (user.role !== 'superadmin' && !school._id.equals(user.school)) {
                throw new AccessDeniedError('Access denied: You do not belong to the same school');
            }
        }

        return await this.Classroom.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteClassroom(id, user) {
        const classroom = await this.Classroom.findById(id).populate('school');
        if (!classroom) {
            throw new NotFoundError('Classroom not found');
        }

        if (user.role !== 'superadmin' && !classroom.school.equals(user.school)) {
            throw new AccessDeniedError('Access denied: You do not belong to the same school');
        }

        return await this.Classroom.findByIdAndDelete(id);
    }

}