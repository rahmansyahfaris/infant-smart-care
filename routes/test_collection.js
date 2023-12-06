const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const TestCollection = require('../models/test_collection')

// Get all
router.get("/", async (req, res) => {
    try {
        const test_collection = await TestCollection.find()
        res.json(test_collection)
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
    const test_input = new TestCollection({
        id: req.body.id,
        timenow: req.body.timenow,
        temperature: req.body.temperature,
        humidity: req.body.humidity,
        admin: req.body.admin,
        emotion: req.body.emotion,
        name: req.body.name,
        gender: req.body.gender,
        birthdate: req.body.birthdate,
        parent_name: req.body.parent_name
    })

    try {
        const newDocument = await test_input.save();
        res.status(201).json(newDocument);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})

// Update one
router.patch("/:id", getDocument, async (req, res) => {
    // menggunakan patch dibanding put: karena hanya ingin mengubah sebagian saja, tidak keseluruhan
    if (req.body.id != null) { res.document.id = req.body.id }
    if (req.body.timenow != null) { res.document.timenow = req.body.timenow }
    if (req.body.temperature != null) { res.document.temperature = req.body.temperature }
    if (req.body.humidity != null) { res.document.humidity = req.body.humidity }
    if (req.body.admin != null) { res.document.admin = req.body.admin }
    if (req.body.emotion != null) { res.document.emotion = req.body.emotion }
    if (req.body.name != null) { res.document.name = req.body.name }
    if (req.body.gender != null) { res.document.gender = req.body.gender }
    if (req.body.birthdate != null) { res.document.birthdate = req.body.birthdate }
    if (req.body.parent_name != null) { res.document.parent_name = req.body.parent_name }
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
        document = await TestCollection.findOne({ id: req.params.id })
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