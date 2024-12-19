const { NotFoundError, AccessDeniedError, BadRequestError } = require('../../../error/error');
const mongoose = require('mongoose');

module.exports = class StudentManager {
    constructor({ mongomodels, validators }) {
        this.Student = mongomodels.student;
        this.Classroom = mongomodels.classroom;
        this.User = mongomodels.user;
        this.validators = validators.student;
    }

    async createStudent(data, user) {
        const validation = this.validators.create.validate(data);
        if (validation.error) {
            throw new BadRequestError(validation.error.details[0].message);
        }

        if (!mongoose.Types.ObjectId.isValid(data.classroom)) {
            throw new BadRequestError('Invalid Classroom');
        }

        const classroom = await this.Classroom.findById(data.classroom).populate('school');
        if (!classroom) {
            throw new NotFoundError('Classroom not found');
        }

        if (user.role !== 'superadmin' && !classroom.school.equals(user.school)) {
            throw new AccessDeniedError('Access denied: You do not belong to the same school as the classroom');
        }

        const studentCount = await this.Student.countDocuments({ classroom: data.classroom });
        if (studentCount >= classroom.capacity) {
            throw new BadRequestError('Classroom capacity exceeded');
        }

        const student = new this.Student({ ...data, school: classroom.school });
        await student.save();
        return student;
    }

    async getStudents(user) {
        if (user.role === 'superadmin') {
            return await this.Student.find().populate('classroom');
        } else if (user.role === 'schooladmin') {
            const classrooms = await this.Classroom.find({ school: user.school });
            const classroomIds = classrooms.map(classroom => classroom._id);
            return await this.Student.find({ classroom: { $in: classroomIds } }).populate('classroom');
        } else {
            throw new AccessDeniedError('Access denied');
        }
    }

    async getStudentsByClassroom(classroomId, user) {
        const classroom = await this.Classroom.findById(classroomId).populate('school');
        if (!classroom) {
            throw new NotFoundError('Classroom not found');
        }

        if (user.role !== 'superadmin' && !classroom.school.equals(user.school)) {
            throw new AccessDeniedError('Access denied: You do not belong to the same school as the classroom');
        }

        return await this.Student.find({ classroom }).populate('classroom');
    }

    async getStudentById(id, user) {
        const student = await this.Student.findById(id).populate('classroom');
        if (!student) {
            throw new NotFoundError('Student not found');
        }

        if (user.role !== 'superadmin' && !student.classroom.school.equals(user.school)) {
            throw new AccessDeniedError('Access denied: You do not belong to the same school as the student');
        }

        return student;
    }

    async updateStudent(id, data, user) {
        const validation = this.validators.update.validate(data);
        if (validation.error) {
            throw new BadRequestError(validation.error.details[0].message);
        }

        const student = await this.Student.findById(id).populate('classroom');
        if (!student) {
            throw new NotFoundError('Student not found');
        }

        if (user.role !== 'superadmin' && !student.classroom.school.equals(user.school)) {
            throw new AccessDeniedError('Access denied: You do not belong to the same school as the student');
        }

        if (data.classroom && !mongoose.Types.ObjectId.isValid(data.classroom)) {
            throw new BadRequestError('Invalid Classroom');
        }
        if (data.classroom && data.classroom !== student.classroom._id.toString()) {
            const classroom = await this.Classroom.findById(data.classroom).populate('school');
            if (!classroom) {
                throw new NotFoundError('Classroom not found');
            }

            if (user.role !== 'superadmin' && !classroom.school.equals(user.school)) {
                throw new AccessDeniedError('Access denied: You do not belong to the same school as the classroom');
            }

            const studentCount = await this.Student.countDocuments({ classroom: data.classroom });
            if (studentCount >= classroom.capacity) {
                throw new BadRequestError('Classroom capacity exceeded');
            }

            data.school = classroom.school;
        }

        return await this.Student.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteStudent(id, user) {
        const student = await this.Student.findById(id).populate('classroom');
        if (!student) {
            throw new NotFoundError('Student not found');
        }

        if (user.role !== 'superadmin' && !student.classroom.school.equals(user.school)) {
            throw new AccessDeniedError('Access denied: You do not belong to the same school as the student');
        }

        return await this.Student.findByIdAndDelete(id);
    }
}