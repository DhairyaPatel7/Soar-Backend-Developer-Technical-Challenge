const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
    age: { type: Number, required: true },
    address: { type: String, required: true },
});

module.exports = studentSchema;