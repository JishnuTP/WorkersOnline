const jwt = require('jsonwebtoken');
const workerModel = require('../Models/workerModel');

module.exports = async (req, res, next) => {
    try {
        const authorizationHeader = req.headers['authorization'];
        if (!authorizationHeader) {
            return res.status(401).json({
                message: 'Authorization header missing',
                success: false
            });
        }
        const token = authorizationHeader.split(' ')[1];
        jwt.verify(token, process.env.worker_Secrect_key, async (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    message: 'Authentication failed',
                    success: false
                });
            } else {
                const role = decoded.role;
                
                if (role === 'worker') {
                    const worker = await workerModel.findOne({ _id: decoded.id });

                    if (!worker) {
                        return res.status(401).json({
                            message: 'User not found',
                            success: false
                        });
                    } else {
                        // Attach the user ID to the request for future use
                        req.body.workerId = decoded.id;
                        next();
                    }
                } else {
                    return res.status(401).json({
                        message: 'Authentication failed',
                        success: false
                    });
                }
            }
        });
    } catch (error) {
        return res.status(401).json({
            message: 'Authentication failed',
            success: false
        });
    }
};
