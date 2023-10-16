const mongoose = require('mongoose')
const workerSchema = mongoose.Schema({
    firstName: {
        type: String,
        requried: true
    },
    lastName: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        default: '-1'
    }
}, {
    timestamps: true
})
const workerModel = mongoose.model('worker', workerSchema)
module.exports = workerModel