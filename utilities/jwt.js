const jwt = require("jsonwebtoken");

/**
 * Generate a JWT token with data
 * @param {Object} data Data to be signed
 * @param {String | Number} expiry Expiry time of the token
 * @returns JWT Token
 */
exports.generateToken = (data, expiry = '4h') => {
    const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: expiry });
    console.log("token generated : ",token);
    return token;
};

/**
 * Verify a JWT Token
 * @param {String} token Token to verify
 * @returns Data
 */
exports.verifyToken = (token) => {
    console.log("token before verifying : ",token)
    const data = jwt.verify(token, process.env.JWT_SECRET);
    console.log("in verify token : data : ",data);
    return data;
};