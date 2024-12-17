const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'schooladmin', 'user'], default: 'user' },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null }, // Map user to a school, null for superadmin
});

module.exports = userSchema;