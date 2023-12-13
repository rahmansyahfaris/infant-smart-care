const express = require('express')
// const mongoose = require('mongoose')
const router = express.Router()
const { Baby } = require('../models/baby.js')

// Get all
router.get("/", async (req, res) => {
    try {
        const document = await Baby.find()
        res.json(document)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Get one
router.get("/:id", getDocument, (req, res) => {
    // req.params.id
    res.json(res.document)
})

// Create one
router.post("/", async (req, res) => {
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
            temperature: req.body.temperature,
            humidity: req.body.humidity,
            emotion_id: req.body.emotion_id,
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
router.patch("/:id", getDocument, async (req, res) => {
    // menggunakan patch dibanding put: karena hanya ingin mengubah sebagian saja, tidak keseluruhan
    if (req.body.baby_id != null) { res.document.baby_id = req.body.baby_id }
    if (req.body.temperature != null) { res.document.temperature = req.body.temperature }
    if (req.body.humidity != null) { res.document.humidity = req.body.humidity }
    if (req.body.emotion_id != null) { res.document.emotion_id = req.body.emotion_id }
    if (req.body.history != null) { res.document.history = req.body.history }
    if (req.body.date_created != null) { res.document.date_created = req.body.date_created }
    try {
        const updatedDocument = await res.document.save()
        res.json(updatedDocument)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Get all history of a baby
router.get("/:id/history", getDocument, (req, res) => {
    // req.params.id
    res.json(res.document.history)
})

// Add a new history for a baby
router.post("/:id/history", getDocument, async (req, res) => {
    try {
        const newHistory = {
            baby_id: req.params.id,
            date: req.body.date,
            temperature: req.body.temperature,
            humidity: req.body.humidity,
            emotion_id: req.body.emotion_id,
        };

        // Add the new history to the baby's history array
        res.document.history.push(newHistory);

        // Change the current conditions of the baby in the baby schema based on this new history
        res.document.date = newHistory.date
        res.document.temperature = newHistory.temperature
        res.document.humidity = newHistory.humidity
        res.document.emotion_id = newHistory.emotion_id

        // Save the updated baby document
        const updatedDocument = await res.document.save();

        res.status(201).json(updatedDocument.history);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Delete one
router.delete("/:id", getDocument, async (req, res) => {
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