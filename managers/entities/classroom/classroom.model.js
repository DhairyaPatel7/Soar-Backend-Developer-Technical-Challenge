const mongoose = require('mongoose');
const classroomSchema = require('./classroom.schema');

module.exports = mongoose.model('Classroom', classroomSchema);