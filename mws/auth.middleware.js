const jwt = require('jsonwebtoken');
const config = require('../config/index.config.js');
const TokenManager = require('../managers/entities/token/Token.manager');
const userModel = require('../managers/entities/user/user.model');

const tokenManager = new TokenManager({ config });

module.exports = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    try {
        console.log('Token:', token);
        const decoded = tokenManager.verifyLongToken({ token });
        if (!decoded) {
            return res.status(400).json({ error: 'Invalid token.' });
        }

        console.log('Decoded token..............', decoded);
        const user = await userModel.findById(decoded.userId);
        console.log('User..............', user);
        req.user = user; 
        next();
    } catch (ex) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};