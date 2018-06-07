const mongoose = require('../../database')
const bcrypt = require('bcrypt')

const TaskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    completed: {
        type: boolean,
        required: true,
        default: false
    }
});

const Task = mongoose.model('Task', TaskSchema)

module.exports = Task;