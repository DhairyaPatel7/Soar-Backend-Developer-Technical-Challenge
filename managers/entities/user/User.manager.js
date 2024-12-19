const bcrypt = require('bcrypt');
const { NotFoundError, AccessDeniedError, BadRequestError } = require('../../../error/error');
const mongoose = require('mongoose');

module.exports = class UserManager { 
    constructor({ mongomodels, validators, managers } = {}) {
        this.validators = validators.user; 
        this.User = mongomodels.user;
        this.tokenManager = managers.token;
        this.School = mongomodels.school;
    }

    async createUser(data) {
        const { username, email, password, role } = data;

        const validation = this.validators.create.validate(data);

        if (validation.error) {
            throw new BadRequestError(validation.error.details[0].message);
        }

        if (data.school) {
            const school = await this.School.findById(data.school);
            if (!school) {
                throw new NotFoundError('Invalid school');
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const createdUser = new this.User({ username, email, password: hashedPassword, role });
        await createdUser.save();
        return {
            user: createdUser
        };
    }

    async authenticateUser(email, password) {
        const user = await this.User.findOne({ email });
        if (!user) {
            throw new BadRequestError('Invalid email or password');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new BadRequestError('Invalid email or password');
        }
        const token = this.tokenManager.genLongToken({ userId: user._id });
        return { user, token };
    }

    async getUsers() {
        return await this.User.find();
    }

    async getUserById(id) {
        const user = await this.User.findById(id).populate('school');
        if (!user) {
            throw new NotFoundError('User not found');
        }
        return user;
    }

    async updateUser(id, data) {
        const validation = this.validators.update.validate(data);
        if (validation.error) {
            throw new BadRequestError(validation.error.details[0].message);
        }

        if (data.school) {
            const school = await this.School.findById(data.school);
            if (!school) {
                throw new NotFoundError('User not found');
            }
        }

        return await this.User.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteUser(id) {
        const userToDelete = await this.User.findById(id).populate('school');
        if (!userToDelete) {
            throw new NotFoundError('User not found');
        }
        return await this.User.findByIdAndDelete(id);
    }
}
