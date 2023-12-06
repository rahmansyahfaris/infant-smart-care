const mongoose = require('mongoose')
const { Counter } = require('./incubator.js')

// schema for counter, auto-increment id by creating a new collection that tracks the number of id
const getNextParentId = async function () {
    try {
        const counter = await Counter.findOneAndUpdate(
            { _id: 'parentId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        if (!counter) {
            throw new Error("Counter document not found.");
        }

        return `parent${counter.seq.toString().padStart(7, '0')}`;
    } catch (error) {
        console.error("Error in getNextParentId:", error);
        throw error;
    }
}

// Parent Schema
const parentSchema = new mongoose.Schema({
    parent_id: {
        type: String,
        unique: true,
        required: true
    },
    type: {
        type: String,
        required: true,
        default: "Parent"
    },
    name: {
        type: String
    },
    hospital_id: {
        type: String
    },
    incubators: {
        type: [String]
    },
    date_created: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'parents' // collection name
})

// Define the function as a static method of the model
parentSchema.statics.getNextParentId = getNextParentId

module.exports = mongoose.model('Parent', parentSchema)