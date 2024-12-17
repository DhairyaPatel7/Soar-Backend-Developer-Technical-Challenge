const mongoose = require('mongoose');

const schoolSchema = require('./school.schema');

module.exports = mongoose.model('School', schoolSchema);