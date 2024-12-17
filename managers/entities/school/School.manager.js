const mongoose = require('mongoose');

module.exports = class SchoolManager {
    constructor({ mongomodels, validators }) {
        this.School = mongomodels.school;
        this.validators = validators.school;
    }

    async createSchool(data) {
        const validation = this.validators.create.validate(data);
        if (validation.error) {
            throw new Error(validation.error.details[0].message);
        }

        const school = new this.School(data);
        await school.save();
        return school;
    }

    async getSchools() {
        return await this.School.find().populate('admin');
    }

    async getSchoolById(id) {
        return await this.School.findById(id).populate('admin');
    }

    async updateSchool(id, data) {
        const validation = this.validators.update.validate(data);
        if (validation.error) {
            throw new Error(validation.error.details[0].message);
        }

        return await this.School.findByIdAndUpdate(id, data, { new: true }).populate('admin');
    }

    async deleteSchool(id) {
        return await this.School.findByIdAndDelete(id);
    }
}