const mongoose = require('mongoose')
const { Counter } = require('./incubator.js')

// schema for counter, auto-increment id by creating a new collection that tracks the number of id
const getNextHospitalId = async function () {
    try {
        const counter = await Counter.findOneAndUpdate(
            { _id: 'hospitalId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        if (!counter) {
            throw new Error("Counter document not found.");
        }

        return `hospital${counter.seq.toString().padStart(7, '0')}`;
    } catch (error) {
        console.error("Error in getNextHospitalId:", error);
        throw error;
    }
}

// Hospital Schema
const hospitalSchema = new mongoose.Schema({
    hospital_id: {
        type: String,
        unique: true,
        required: true
    },
    type: {
        type: String,
        required: true,
        default: "Hospital"
    },
    name: {
        type: String
    },
    address: {
        type: String
    },
    date_created: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'hospitals' // collection name
})

// Define the function as a static method of the model
hospitalSchema.statics.getNextHospitalId = getNextHospitalId

module.exports = mongoose.model('Hospital', hospitalSchema)