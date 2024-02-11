const express = require('express')
// const mongoose = require('mongoose')
const router = express.Router()
const Admin = require('../models/admin.js')
const { verifyToken } = require('../auth_middleware.js')

router.use(verifyToken)

// Get all
router.get("/", async (req, res) => {
    try {
        const admin = await Admin.find()
        res.json(admin)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Get the admin account that is being accessed
router.get("/account", async (req, res) => {
    try {
        const admin = await Admin.findOne({ email: req.decoded.admin })
        res.json(admin)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Get one
router.get("/:id", getAdmin, (req, res) => {
    // req.params.id
    res.json(res.document)
})

// Create one
router.post("/", async (req, res) => {
    try {
        let admin_input
        let admin_id_used // the id that will be assigned, determined using the if else statement below

        // use own unique id (if) or use autoincremented id (else)
        // do not follow conventional autoincremented id pattern if you want to use your own id
        if (req.body.admin_id) {
            admin_id_used = req.body.admin_id
        } else {
            const adminId = await Admin.getNextAdminId() // generate incubator id
            admin_id_used = adminId
        }

        // finalized data
        admin_input = new Admin({
            admin_id: admin_id_used,
            name: req.body.name,
            hospital_id: req.body.hospital_id,
            email: req.body.email,
            password: req.body.password,
            date_created: req.body.date_created
        })

        const newDocument = await admin_input.save();
        res.status(201).json(newDocument);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})

// Update one
router.patch("/:id", getAdmin, async (req, res) => {
    // menggunakan patch dibanding put: karena hanya ingin mengubah sebagian saja, tidak keseluruhan
    if (req.body.admin_id != null) { res.document.admin_id = req.body.admin_id }
    if (req.body.name != null) { res.document.name = req.body.name }
    if (req.body.hospital_id != null) { res.document.hospital_id = req.body.hospital_id }
    if (req.body.email != null) { res.document.email = req.body.email }
    if (req.body.password != null) { res.document.password = req.body.password }
    if (req.body.date_created != null) { res.document.date_created = req.body.date_created }
    try {
        const updatedDocument = await res.document.save()
        res.json(updatedDocument)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

// Delete one
router.delete("/:id", getAdmin, async (req, res) => {
    try {
        await res.document.deleteOne()
        res.json({ message: "Document successfully deleted" })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Middleware
async function getAdmin(req, res, next) {
    let document
    try {
        document = await Admin.findOne({ admin_id: req.params.id }) // req.params.id (id di sini match sama id yang ada di parameter linknya, yakni "/:id")
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