const express = require('express')
// const mongoose = require('mongoose')
const router = express.Router()
const Emotion = require('../models/emotion.js')

// Get all
router.get("/", async (req, res) => {
    try {
        const document = await Emotion.find()
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
        const input = new Emotion({
            emotion_id: req.body.emotion_id,
            name: req.body.name,
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
    if (req.body.emotion_id != null) { res.document.emotion_id = req.body.emotion_id }
    if (req.body.name != null) { res.document.name = req.body.name }
    if (req.body.date_created != null) { res.document.date_created = req.body.date_created }
    try {
        const updatedDocument = await res.document.save()
        res.json(updatedDocument)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

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
        document = await Emotion.findOne({ emotion_id: req.params.id }) // req.params.id (id di sini match sama id yang ada di parameter linknya, yakni "/:id")
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