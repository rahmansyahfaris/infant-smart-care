const express = require('express')
// const mongoose = require('mongoose')
const router = express.Router()
const Parent = require('../models/parent.js')

// Get all
router.get("/", async (req, res) => {
    try {
        const document = await Parent.find()
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
        if (req.body.parent_id) {
            id_used = req.body.parent_id
        } else {
            const generated_id = await Parent.getNextParentId() // generate autoincremented id
            id_used = generated_id
        }

        // finalized data
        input = new Parent({
            parent_id: id_used,
            name: req.body.name,
            hospital_id: req.body.hospital_id,
            incubators: req.body.incubators,
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
    if (req.body.parent_id != null) { res.document.parent_id = req.body.parent_id }
    if (req.body.name != null) { res.document.name = req.body.name }
    if (req.body.hospital_id != null) { res.document.hospital_id = req.body.hospital_id }
    if (req.body.incubators != null) { res.document.incubators = req.body.incubators }
    if (req.body.date_created != null) { res.document.date_created = req.body.date_created }
    try {
        const updatedDocument = await res.document.save()
        res.json(updatedDocument)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Add incubators
router.patch("/:id/add-incubators", getDocument, async (req, res) => {
    const newIncubators = req.body.incubators

    if (!Array.isArray(newIncubators) || newIncubators.length === 0) {
        return res.status(400).json({ message: 'An array of incubators is required (use incubator_id)' })
    }

    try {
        // Use $addToSet to add new incubators to the existing array
        await Parent.updateOne({ parent_id: res.document.parent_id }, { $addToSet: { incubators: { $each: newIncubators } } })
        // Fetch the updated document
        const updatedParent = await Parent.findOne({ parent_id: res.document.parent_id })

        res.json(updatedParent);
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Remove incubators
router.patch("/:id/remove-incubators", getDocument, async (req, res) => {
    const incubatorsToRemove = req.body.incubators

    if (!Array.isArray(incubatorsToRemove) || incubatorsToRemove.length === 0) {
        return res.status(400).json({ message: 'An array of incubators is required (use incubator_id)' })
    }

    try {
        // Use $pull to remove parents to the existing array
        await Parent.updateOne({ parent_id: res.document.parent_id }, { $pull: { incubators: { $in: incubatorsToRemove } } })
        // Fetch the updated document
        const updatedParent = await Parent.findOne({ parent_id: res.document.parent_id })

        res.json(updatedParent);
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
        document = await Parent.findOne({ parent_id: req.params.id }) // req.params.id (id di sini match sama id yang ada di parameter linknya, yakni "/:id")
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