const express = require('express')
const moment = require('moment-timezone')
// const mongoose = require('mongoose')
const router = express.Router()
const { Baby } = require('../models/baby.js')
const { checkApiKey, verifyToken } = require('../auth_middleware.js')

// Timezone using WIB
const outputTimezone = "Asia/Jakarta"

// How many history to store before it gets deleted one by one
const historyLimit = 10

// Function to convert ISO8601 to custom time format
function convertISO8601(iso8601String, outputTimeZone) {
    // Create a moment object with the ISO 8601 string in UTC
    const momentObj = moment.utc(iso8601String);
  
    // Set the output time zone
    momentObj.tz(outputTimeZone);
  
    // Format the moment object to the custom format
    const customFormat = momentObj.format('DD/MM/YYYY HH:mm:ss');
  
    return customFormat;
}

// Get all
router.get("/", verifyToken, async (req, res) => {
    try {
        const document = await Baby.find()
        res.json(document)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Get one
router.get("/:id", verifyToken, getDocument, (req, res) => {
    // req.params.id
    res.json(res.document)
})

// Create one
router.post("/", verifyToken, async (req, res) => {
    try {
        let input // the document that will be finalized
        let id_used // the id that will be assigned, determined using the if else statement below

        // use own unique id (if) or use autoincremented id (else)
        // do not follow conventional autoincremented id pattern if you want to use your own id
        if (req.body.baby_id) {
            id_used = req.body.baby_id
        } else {
            const generated_id = await Baby.getNextBabyId() // generate autoincremented id
            id_used = generated_id
        }

        // finalized data
        input = new Baby({
            baby_id: id_used,
            history: req.body.history,
            date_created: req.body.date_created
        })

        const newDocument = await input.save();
        res.status(201).json(newDocument);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})

// Update one
router.patch("/:id", verifyToken, getDocument, async (req, res) => {
    // menggunakan patch dibanding put: karena hanya ingin mengubah sebagian saja, tidak keseluruhan
    if (req.body.baby_id != null) { res.document.baby_id = req.body.baby_id }
    if (req.body.history != null) {
        if (Array.isArray(req.body.history)) {
            // Update 'history' if it's an array
            res.document.history = req.body.history;
        } else if (req.body.history.length === 0) {
            // If 'history' is provided as an empty array, set it to an empty array
            res.document.history = [];
        }
    }
    if (req.body.date_created != null) { res.document.date_created = req.body.date_created }
    try {
        const updatedDocument = await res.document.save()
        res.json(updatedDocument)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Get all history of a baby
router.get("/:id/history", verifyToken, getDocument, (req, res) => {
    // req.params.id
    res.json(res.document.history)
})

// Get the latest history of a baby
router.get("/:id/latest-history", verifyToken, getDocument, (req, res) => {
    // req.params.id
    res.json(res.document.history[res.document.history.length-1])
})

// Add a new history for a baby
router.post("/:id/history", checkApiKey, getDocument, async (req, res) => {
    try {
        const newHistory = {
            baby_id: req.params.id,
            date: convertISO8601(req.body.date_iso8601, outputTimezone),
            date_iso8601: req.body.date_iso8601,
            temperature_incubator: req.body.temperature_incubator,
            temperature_baby: req.body.temperature_baby,
            humidity: req.body.humidity,
            heart_rate: req.body.heart_rate,
            spo2: req.body.spo2,
            emotion_id: req.body.emotion_id,
        };

        // Add the new history to the baby's history array
        res.document.history.push(newHistory);

        // Limits the history count by deleting the past histories each time new histories are added
        if (res.document.history.length > historyLimit) {
            res.document.history.splice(0, res.document.history.length - historyLimit);
        }

        // Save the updated baby document
        const updatedDocument = await res.document.save();

        res.status(201).json(updatedDocument.history);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Delete one
router.delete("/:id", verifyToken, getDocument, async (req, res) => {
    try {
        await res.document.deleteOne()
        res.json({ message: "Document successfully deleted" })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Middleware
async function getDocument(req, res, next) {
    let document
    try {
        document = await Baby.findOne({ baby_id: req.params.id }) // req.params.id (id di sini match sama id yang ada di parameter linknya, yakni "/:id")
        if (document == null) {
            return res.status(404).json({ message: 'Cannot find document' })
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }

    res.document = document
    next()
}

module.exports = router