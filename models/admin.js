const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { Counter } = require('./incubator.js')

const SALT_ROUNDS = 10

// schema for counter, auto-increment id by creating a new collection that tracks the number of id
const getNextAdminId = async function () {
    try {
        const counter = await Counter.findOneAndUpdate(
            { _id: 'adminId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        if (!counter) {
            throw new Error("Counter document not found.");
        }

        return `admin${counter.seq.toString().padStart(7, '0')}`;
    } catch (error) {
        console.error("Error in getNextAdminId:", error);
        throw error;
    }
}

const adminSchema = new mongoose.Schema({
    admin_id: {
        type: String,
        unique: true,
        required: true
    },
    type: {
        type: String,
        required: true,
        default: "Admin"
    },
    name: {
        type: String,
        required: true
    },
    hospital_id: {
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
    date_created: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'admins' // collection name
})

// Middleware for schema password encryption
adminSchema.pre('save', async function (next) {
    const admin = this
    if (!admin.isModified('password')) return next()

    try {
        const hashedPassword = await bcrypt.hash(admin.password, SALT_ROUNDS)
        admin.password = hashedPassword
        return next()
    } catch (err) {
        return next(err)
    }
})

// Define the function as a static method of the model
adminSchema.statics.getNextAdminId = getNextAdminId

module.exports = mongoose.model('Admin', adminSchema)