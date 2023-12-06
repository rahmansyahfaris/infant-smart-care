const express = require('express')
// const mongoose = require('mongoose')
const router = express.Router()
const { Incubator } = require('../models/incubator.js')

// Get all
router.get("/", async (req, res) => {
    try {
        const incubator = await Incubator.find()
        res.json(incubator)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Get one
router.get("/:id", getIncubator, (req, res) => {
    // req.params.id
    res.json(res.document)
})

// Create one with optional id input
router.post("/", async (req, res) => {
    try {
        let incubator_input
        let incubator_id_used // the id that will be assigned, determined using the if else statement below

        // use own unique id (if) or use autoincremented id (else)
        // do not follow conventional autoincremented id pattern if you want to use your own id
        if (req.body.incubator_id) {
            incubator_id_used = req.body.incubator_id
        } else {
            const incubatorId = await Incubator.getNextIncubatorId() // generate incubator id
            incubator_id_used = incubatorId
        }

        // finalized data
        incubator_input = new Incubator({
            incubator_id: incubator_id_used,
            name: req.body.name,
            birth_date: req.body.birth_date,
            gender: req.body.gender,
            parents: req.body.parents,
            baby_id: req.body.baby_id,
            admin_id: req.body.admin_id,
            date_created: req.body.date_created
        })

        const newDocument = await incubator_input.save();
        res.status(201).json(newDocument);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})

// Update one
router.patch("/:id", getIncubator, async (req, res) => {
    // menggunakan patch dibanding put: karena hanya ingin mengubah sebagian saja, tidak keseluruhan
    if (req.body.incubator_id != null) { res.document.incubator_id = req.body.incubator_id }
    if (req.body.name != null) { res.document.name = req.body.name }
    if (req.body.birth_date != null) { res.document.birth_date = req.body.birth_date }
    if (req.body.gender != null) { res.document.gender = req.body.gender }
    if (req.body.parents != null) { res.document.parents = req.body.parents }
    if (req.body.baby_id != null) { res.document.baby_id = req.body.baby_id }
    if (req.body.admin_id != null) { res.document.admin_id = req.body.admin_id }
    if (req.body.date_created != null) { res.document.date_created = req.body.date_created }
    try {
        const updatedDocument = await res.document.save()
        res.json(updatedDocument)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Add parents
router.patch("/:id/add-parents", getIncubator, async (req, res) => {
    const newParents = req.body.parents

    if (!Array.isArray(newParents) || newParents.length === 0) {
        return res.status(400).json({ message: 'An array of parents is required (use parent_id)' })
    }

    try {
        // Use $addToSet to add new parents to the existing array
        await Incubator.updateOne({ incubator_id: res.document.incubator_id }, { $addToSet: { parents: { $each: newParents } } })
        // Fetch the updated document
        const updatedIncubator = await Incubator.findOne({ incubator_id: res.document.incubator_id })

        res.json(updatedIncubator);
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Remove parents
router.patch("/:id/remove-parents", getIncubator, async (req, res) => {
    const parentsToRemove = req.body.parents

    if (!Array.isArray(parentsToRemove) || parentsToRemove.length === 0) {
        return res.status(400).json({ message: 'An array of parents is required (use parent_id)' })
    }

    try {
        // Use $pull to remove parents to the existing array
        await Incubator.updateOne({ incubator_id: res.document.incubator_id }, { $pull: { parents: { $in: parentsToRemove } } })
        // Fetch the updated document
        const updatedIncubator = await Incubator.findOne({ incubator_id: res.document.incubator_id })

        res.json(updatedIncubator);
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Delete one
router.delete("/:id", getIncubator, async (req, res) => {
    try {
        await res.document.deleteOne()
        res.json({ message: "Document successfully deleted" })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Middleware
async function getIncubator(req, res, next) {
    let document
    try {
        document = await Incubator.findOne({ incubator_id: req.params.id }) // req.params.id (id di sini match sama id yang ada di parameter linknya, yakni "/:id")
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