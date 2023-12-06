const mongoose = require('mongoose')

const testCollectionSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    timenow: {
        type: Date,
        required: true,
        default: Date.now
    },
    temperature: {
        type: Number,
        required: true,
        Default: 0.0
    },
    humidity: {
        type: Number,
        required: true,
        Default: 0.0
    },
    admin: {
        type: String,
        required: true,
        Default: "Test Admin"
    },
    emotion: {
        type: String,
        required: true,
        Default: "normal"
    },
    name: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true,
        default: "No data"
    },
    birthdate: {
        type: Date,
        required: true,
        default: Date.now
    },
    parent_name: {
        type: String,
        required: true,
        default: "Unknown"
    }
}, {
    collection: 'test_collection' // collection name
})

module.exports = mongoose.model('TestCollection', testCollectionSchema)