const mongoose = require('mongoose')
const { Counter } = require('./incubator.js')

// schema for counter, auto-increment id by creating a new collection that tracks the number of id
const getNextBabyId = async function () {
    try {
        const counter = await Counter.findOneAndUpdate(
            { _id: 'babyId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        if (!counter) {
            throw new Error("Counter document not found.");
        }

        return `baby${counter.seq.toString().padStart(7, '0')}`;
    } catch (error) {
        console.error("Error in getNextBabyId:", error);
        throw error;
    }
}

// Multiple recorded history for the baby, stored inside the history field of the babySchema
const historySchema = new mongoose.Schema({
    baby_id: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    type: { type: String, required: true, default: "History" },
    temperature: { type: Number },
    humidity: { type: Number },
    emotion_id: { String }
})

// Baby Schema
const babySchema = new mongoose.Schema({
    baby_id: {
        type: String,
        unique: true,
        required: true
    },
    type: {
        type: String,
        required: true,
        default: "Baby"
    },
    temperature: {
        type: Number
    },
    humidity: {
        type: Number
    },
    emotion_id: {
        type: String
    },
    history: {
        type: [historySchema]
    },
    date_created: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'babies' // collection name
})

// Define the function as a static method of the model
babySchema.statics.getNextBabyId = getNextBabyId

const Baby = mongoose.model('Baby', babySchema)
const History = mongoose.model('History', historySchema)

module.exports = { Baby, History }