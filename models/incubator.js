const mongoose = require('mongoose')

// schema for counter, auto-increment id by creating a new collection that tracks the number of id
const CounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 1 }
});

const Counter = mongoose.model('Counter', CounterSchema);

const getNextIncubatorId = async function () {
    try {
        const counter = await Counter.findOneAndUpdate(
            { _id: 'incubatorId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        if (!counter) {
            throw new Error("Counter document not found.");
        }

        return `incubator${counter.seq.toString().padStart(7, '0')}`;
    } catch (error) {
        console.error("Error in getNextIncubatorId:", error);
        throw error;
    }
}

const incubatorSchema = new mongoose.Schema({
    incubator_id: {
        type: String,
        unique: true,
        required: true
    },
    type: {
        type: String,
        required: true,
        default: "Incubator"
    },
    name: {
        type: String
    },
    birth_date: {
        type: String
    },
    birth_date_iso8601: {
        type: Date
    },
    gender: {
        type: String
    },
    parents: {
        type: [String]
    },
    baby_id: {
        type: String
    },
    admin_id: {
        type: String
    },
    date_created: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'incubators' // collection name
})

// Define getNextIncubatorId as a static method of the Incubator model
incubatorSchema.statics.getNextIncubatorId = getNextIncubatorId;

module.exports = {
    Incubator: mongoose.model('Incubator', incubatorSchema), 
    Counter: mongoose.model('Counter', CounterSchema)
}