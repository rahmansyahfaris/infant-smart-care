// Setup
require('dotenv').config()

const express = require('express')
const app = express() // app for the ISC API
const tcapp = express() // app for test collection API (for testing)
const mongoose = require('mongoose')
const fs = require('fs')
const port = 3000 // port for the ISC API
const tcport = 4000 // port for test collection API (for testing)

// Connect to the database with mongoose
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db =  mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log("Connected to Database"))

// Load authorization middleware
const { checkApiKey, allowOnlyWhitelistedIPs } = require("./auth_middleware.js")

// use express js
app.use(express.json())
tcapp.use(express.json())

// apply authorization middleware to all routes
// app.use(checkApiKey)
// app.use(allowOnlyWhitelistedIPs)

tcapp.get('/test_collection_documentation', async (req, res) => {
    await fs.readFile('./test_collection_documentation.txt', 'utf8', (err, data) => {
        if (err) throw err;
        // isi txt file ada di variabel data
        const preformattedText = `<pre>${data}</pre>`; // data masih belum merender new line jadi harus dirender dengan ini
        res.send(preformattedText);
    })
    
    // more details?
});

// Router Test Collection
const testCollectionRouter = require('./routes/test_collection.js')
tcapp.use('/test_collection', testCollectionRouter)

// Router Incubators
const incubatorRouter = require('./routes/incubator.js')
app.use('/incubator', incubatorRouter)

// Router Admins
const adminRouter = require('./routes/admin.js')
app.use('/admin', adminRouter)

// Router Babies
const babyRouter = require('./routes/baby.js')
app.use('/baby', babyRouter)

// Router Parents
const parentRouter = require('./routes/parent.js')
app.use('/parent', parentRouter)

// Router Hospitals
const hospitalRouter = require('./routes/hospital.js')
app.use('/hospital', hospitalRouter)

// Router Emotions
const emotionRouter = require('./routes/emotion.js')
app.use('/emotion', emotionRouter)

// port listen
app.listen(port, () => console.log("Server Started"))
tcapp.listen(tcport, () => console.log("Test Collection API Started"))