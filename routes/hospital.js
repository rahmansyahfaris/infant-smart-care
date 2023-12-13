const express = require('express')
// const mongoose = require('mongoose')
const router = express.Router()
const Hospital = require('../models/hospital.js')

// Get all
router.get("/", async (req, res) => {
    try {
        const document = await Hospital.find()
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
        if (req.body.hospital_id) {
            id_used = req.body.hospital_id
        } else {
            const generated_id = await Hospital.getNextHospitalId() // generate autoincremented id
            id_used = generated_id
        }

        // finalized data
        input = new Hospital({
            hospital_id: id_used,
            name: req.body.name,
            address: req.body.address,
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
    if (req.body.hospital_id != null) { res.document.hospital_id = req.body.hospital_id }
    if (req.body.name != null) { res.document.name = req.body.name }
    if (req.body.address != null) { res.document.address = req.body.address }
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
        document = await Hospital.findOne({ hospital_id: req.params.id }) // req.params.id (id di sini match sama id yang ada di parameter linknya, yakni "/:id")
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