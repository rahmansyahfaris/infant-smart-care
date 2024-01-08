const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
// const mongoose = require('mongoose')
const router = express.Router()
const Admin = require('../models/admin.js')

const jwtSecretKey = process.env.JWT_SECRET_KEY
const expiresInSeconds = 4 * 60 * 60 // 4 hours

router.use(bodyParser.json())

// Admin Register
router.post("/register", async (req, res) => {
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

// Admin Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find the user by username
      const admin = await Admin.findOne({ email });
  
      // If the user does not exist
      if (!admin) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      // Compare the provided password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(password, admin.password);
  
      // If passwords match, create and send a JWT token
      if (passwordMatch) {
        const token = jwt.sign({ admin: admin.email }, jwtSecretKey, { expiresIn: expiresInSeconds });
        return res.json({ token });
      } else {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router