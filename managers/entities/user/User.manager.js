const bcrypt = require('bcrypt');

module.exports = class UserManager { 
    constructor({ mongomodels, validators, managers } = {}) {
        // this.config = config;
        // this.cortex = cortex;
        this.validators = validators.user; 
        this.User = mongomodels.user;
        this.tokenManager = managers.token;
        this.School = mongomodels.school;
        // this.usersCollection = "users";
        // this.userExposed = ['createUser'];
    }

    async createUser(data) {
        const { username, email, password, role } = data;

        // Data validation
        const validation = this.validators.create.validate(data);

        if (validation.error) {
            throw new Error(validation.error.details[0].message);
        }

        if (data.school) {
            const school = await this.School.findById(data.school);
            if (!school) {
                throw new Error('Invalid school');
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
            throw new Error('Invalid email or password');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }
        const token = this.tokenManager.genLongToken({ userId: user._id });
        return { user, token };
    }

    async getUsers() {
        return await this.User.find();
    }

    async getUserById(id) {
        return await this.User.findById(id);
    }

    async updateUser(id, data) {
        const validation = this.validators.update.validate(data);
        if (validation.error) {
            throw new Error(validation.error.details[0].message);
        }

        if (data.school) {
            const school = await this.School.findById(data.school);
            if (!school) {
                throw new Error('Invalid school');
            }
        }

        return await this.User.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteUser(id) {
        const user = await this.User.findByIdAndDelete(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
}
