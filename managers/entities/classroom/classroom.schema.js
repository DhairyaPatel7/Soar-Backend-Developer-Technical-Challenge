const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    capacity: { type: Number, required: true },
    resources: { type: [String], default: [] },
});

module.exports = classroomSchema;