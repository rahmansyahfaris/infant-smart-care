require('dotenv').config()

const ip = require('ip')
const authorizedKeys = process.env.API_KEY.split(',');
const allowedIPs = process.env.ALLOWED_IPS.split(',');

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


module.exports = { checkApiKey, allowOnlyWhitelistedIPs };