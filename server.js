// Setup
require('dotenv').config()

const express = require('express')
const app = express() // app for the ISC API
// const testCollectionApp = express() // app for test collection API (for testing)
const mongoose = require('mongoose')
const fs = require('fs')
const cors = require('cors') // CORS
const bodyParser = require('body-parser')
const swaggerJsdoc = require("swagger-jsdoc") // Swagger used for API documentation
const swaggerUi = require("swagger-ui-express") // Swagger used for API documentation
const port = 3000 // port for the ISC API
// const tcport = 4000 // port for test collection API (for testing)
const HOST = '0.0.0.0' // IP and port binding


// CORS Setup
const corsOptions = {
    origin: '*',
}
app.use(cors(corsOptions))
/*app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origins", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})*/
// testCollectionApp.use(cors())

// Connect to the database with mongoose
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db =  mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log("Connected to Database"))

// Load authorization middleware
const { checkApiKey, allowOnlyWhitelistedIPs } = require("./auth_middleware.js")

// use express js
app.use(express.json())
// testCollectionApp.use(express.json())

// apply authorization middleware to all routes
// app.use(checkApiKey)
// app.use(allowOnlyWhitelistedIPs)

/*
testCollectionApp.get('/test_collection_documentation', async (req, res) => {
    await fs.readFile('./test_collection_documentation.txt', 'utf8', (err, data) => {
        if (err) throw err;
        // isi txt file ada di variabel data
        const preformattedText = `<pre>${data}</pre>`; // data masih belum merender new line jadi harus dirender dengan ini
        res.send(preformattedText);
    })
    
    // more details?
});
*/

// Router Test Collection
// const testCollectionRouter = require('./routes/test_collection.js')
// testCollectionApp.use('/test_collection', testCollectionRouter)

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

// API Documentation
const options = {
    definition: {
      openapi: "3.1.0",
      info: {
        title: "Infant Smart Care Protel API",
        version: "0.1.0",
        description:
          "A simple CRUD API application made with Express and documented with Swagger for Protel Project of Infant Smart Care",
        contact: {
          name: "Muhammad Faris Rahmansyah",
          url: "https://github.com/rahmansyahfaris",
          email: "rahmansyahfaris@gmail.com",
        },
      },
      servers: [{ url: "http://localhost:3000", },
      ],
    },
    apis: ["./swagger/*.yaml"],
  };
const specs = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// port listen
app.listen(port, () => console.log("Server Started")) // the port to the API
// testCollectionApp.listen(tcport, () => console.log("Test Collection API Started")) // just initial API test