require('dotenv').config()
const jwt = require('jsonwebtoken');

const ip = require('ip')
const authorizedKeys = process.env.API_KEY.split(',');
const allowedIPs = process.env.ALLOWED_IPS.split(',');

const jwtSecretKey = process.env.JWT_SECRET_KEY;

const checkApiKey = (req, res, next) => {
    const apiKey = req.headers['api-key'];

    if (!apiKey || !authorizedKeys.includes(apiKey)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    next();
};

const allowOnlyWhitelistedIPs = (req, res, next) => {
  const clientIP = req.ip; // Express.js provides the IP address in the req object
  // console.log(clientIP) // to know what is the IP that is accessing
  if (allowedIPs.includes(clientIP)) {
    return next(); // Allow the request to continue
  } else {
    return res.status(403).json({ message: 'Forbidden: Access denied from this IP address.' });
  }
};

// Apply the middleware to specific routes or globally using this:
// app.use(allowOnlyWhitelistedIPs);

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  // Get the token from the request headers, query parameters, or wherever you've set it
  const token = req.headers.authorization || req.query.token
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  // Verify the token
  jwt.verify(token, jwtSecretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: `Failed to authenticate token ${err}` });
    }
    // Attach the decoded payload to the request object for later use if needed
    req.decoded = decoded;
    // Continue to the next middleware or route handler
    next();
  });
};


module.exports = { checkApiKey, allowOnlyWhitelistedIPs, verifyToken }