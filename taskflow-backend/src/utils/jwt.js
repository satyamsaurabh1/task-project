const jwt = require('jsonwebtoken');

const generateAccessToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
});

module.exports = {
    generateAccessToken
};
