const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String },
    established: { type: Date },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Map school to a user (school admin)
});

module.exports = schoolSchema;