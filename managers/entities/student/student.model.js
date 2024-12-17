const mongoose = require('mongoose');
const studentSchema = require('./student.schema');

module.exports = mongoose.model('Student', studentSchema);