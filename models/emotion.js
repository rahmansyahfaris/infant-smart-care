const mongoose = require('mongoose')

// Emotion Schema (Emotion doesn't have auto-increment id implemented)
const emotionSchema = new mongoose.Schema({
    emotion_id: {
        type: String,
        unique: true,
        required: true
    },
    type: {
        type: String,
        required: true,
        default: "Emotion"
    },
    name: {
        type: String
    },
    date_created: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'emotions' // collection name
})

module.exports = mongoose.model('Emotion', emotionSchema)