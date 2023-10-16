// const jwt = require('jsonwebtoken')

// module.exports = async (req, res, next) => {
//     try {
//         const token = req.headers['authorization'].split(' ')[1]
//         jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
//             if (err) {
                
//                 return res
//                     .status(401).send({
//                         message: 'Auth failed',
//                         success: false
//                     })
//             } else {
//                 // console.log('next')
//                 req.body.userId = decoded.id;
//                 next()
//             }
//         })
//     } catch (error) {
//         return res.status(401).send({
//             message: 'Auth failed',
//             success: false
//         })
//     }
// }

const jwt = require('jsonwebtoken');
const userModel = require('../Models/userModel');

module.exports = async (req, res, next) => {
    try {
        // Check if the 'Authorization' header exists in the request
        const authorizationHeader = req.headers['authorization'];

        if (!authorizationHeader) {
            return res.status(401).json({
                message: 'Authorization header missing',
                success: false
            });
        }

        // Extract the token from the header
        const token = authorizationHeader.split(' ')[1];

        jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    message: 'Authentication failed',
                    success: false
                });
            } else {
                const role = decoded.role;
                
                if (role === 'user') {
                    const user = await userModel.findOne({ _id: decoded.id });

                    if (!user) {
                        return res.status(401).json({
                            message: 'User not found',
                            success: false
                        });
                    } else {
                        // Attach the user ID to the request for future use
                        req.body.userId = decoded.id;
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
