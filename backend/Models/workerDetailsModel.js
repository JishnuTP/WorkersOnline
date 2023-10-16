const mongoose = require('mongoose');

const workerDetailsSchema = mongoose.Schema({
    worker_id: {
        type: String,
        ref: 'worker',
        required: true
    },
    category_id: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    midBudjet: {
        type: String,
        required: true
    },
    availble: {
        type: String,
        required: true
    },
    discription: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    averageRating: {
        type: Number,
        required: false
    }
});
const workerMoreDetailsModel = mongoose.model('workerMoreDetail', workerDetailsSchema)
module.exports = workerMoreDetailsModel