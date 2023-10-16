const workerModel = require('../Models/workerModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodeMailer = require('nodemailer')
const workerMoreDetailsModel = require('../Models/workerDetailsModel');
const mediaModel = require('../Models/mediaModel');
const sharp = require('sharp');
const categoryModel = require('../Models/categoryModel');
const bookingModel = require('../Models/bookingSchema');
const notificationModel = require('../Models/workerNotificationModel');
const userNotificationModel = require('../Models/userNotificationModel');
const userModel = require('../Models/userModel')
const ratingModel = require('../Models/ratingModel');
const cloudinary = require('cloudinary').v2
const chatModel = require('../Models/chatModel')
const bannerModel = require('../Models/bannerModel')

cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
    secure: true,
});


// otp generation
const otpGenerate = () => {
    const otp = Math.floor(Math.random() * 9000) + 1000
    return otp
}
// mail sending function
const sendVerifyMail = async (name, email, otp) => {
    try {
        const subOtp = otp.toString()
        console.log(otp)
        const trasporter = nodeMailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.email,
                pass: process.env.password
            }
        })
        const mailOptions = {
            from: process.env.email,
            to: email,
            subject: 'For verifation mail',
            html: `<p>hi${name} this is your otp${otp}`
        }
        trasporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error.message)
            } else {
                console.log('email has send', info.response)
            }
        })
    } catch (error) {
        console.log(error.message)
    }
}
// pasword hashing
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash
    } catch (error) {
        console.log(error.message)
    }
}
// sign Up
const signUp = async (req, res) => {
    try {
        const otpData = await workerModel.findOne({ otp: req.body.otp })
        if (otpData) {
            await workerModel.updateOne({ email: req.body.email }, { $set: { otp: 'isVerified' } })
            return res.status(200).send({ message: 'Registration success', success: 'isVerified' })
        }
        if (req.body.firstName.trim().length === 0) {
            return res.status(200).send({ message: 'Space not allowed', success: 'name_space' })
        } else if (req.body.lastName.trim().length === 0) {
            return res.status(200).send({ message: 'Space not allowed', success: 'last_name' })
        } else if (req.body.mobile.trim().length === 0 || req.body.mobile.length < 9 || req.body.mobile.length > 10) {
            return res.status(200).send({ message: 'please enter valid mobile number', success: 'number_valid' })
        } else if (req.body.password.trim().length === 0) {
            return res.status(200).send({ message: 'Space not allowed', success: 'password_space' })
        } else {
            const Exist = await workerModel.findOne({ email: req.body.email })
            if (Exist) {
                return res.status(200).send({ message: 'Email already Exist please check your email', success: 'Exist' })
            }
            const fullName = req.body.firstName.concat(' ', req.body.lastName)
            const otp = otpGenerate()
            sendVerifyMail(fullName, req.body.email, otp)
            const subOtp = otp.toString()
            const passwordHash = await securePassword(req.body.password)
            req.body.password = passwordHash
            const newWorker = new workerModel(req.body)
            await newWorker.save();
            await workerModel.updateOne({ email: req.body.email }, { $set: { otp: otp } })
            res.status(200).send({ message: 'Opt sended your mail', success: true, otp: subOtp })
        }
    } catch (error) {
        res.status(500).send({ message: 'Registration Failed', success: false })
    }
}


const login = async (req, res) => {
    try {
        const user = await workerModel.findOne({ email: req.body.email })
        if (!user) {
            return res.status(200).send({ message: 'User not exist please sign Up ', success: false })
        }
        const isMatch = await bcrypt.compare(req.body.password, user.password)
        if (!isMatch) {
            return res.status(200).send({ message: 'Password incorrect please check', success: false })
        }
        if (user.otp === 'isVerified') {
            const token = jwt.sign({ id: user._id , role:'worker'}, process.env.worker_Secrect_key, {
                expiresIn: "1d"
            })
            res.status(200).send({ message: 'Login successfull', success: true, data: token })
        } else if (user.otp === 'Blocked') {
            return res.status(200).send({ message: 'You are in Blocked', success: false })
        }
        else {
            res.status(200).send({ message: 'please sign up ', success: false })
        }
    } catch (error) {
        res.status(500).send({ message: 'Error logged in ', success: false, error })
    }
}

const forgotPassword = async (req, res) => {
    try {
        if (req.body.otp === false) {
            const worker = await workerModel.findOne({ email: req.body.email })
            if (!worker) {
                return res.status(200)
                    .send({ message: 'Invalid Email', success: false })
            }
            const otp = otpGenerate()
            const fullName = worker.firstName.concat(' ', worker.lastName)
            sendVerifyMail(fullName, req.body.email, otp)
            const otps = otp.toString()
            
           
            res.status(200).send({ message: 'OTP has been sended .please chck your mail', success: true, otp: otps })
        }
    } catch (error) {
        res.status(500).send({ message: 'Forgot password fail', success: false, error })
    }
}


const setPassword = async (req, res) => {
    try {
        console.log(req.body,'bodysss')
        console.log(req.body.email)
        if (req.body.value.password === req.body.value.conPassword) {
            const passwordHash = await securePassword(req.body.value.password)
            await workerModel.updateOne({ email: req.body.email }, { $set: { password: passwordHash, otp: 'isVerified' } })
            return res.status(200).send({ message: 'Password Updated', success: true })
        }
        res.status(200).send({ message: 'There are different password please check', success: false })
    } catch (error) {
        res.status(500).send({ message: 'somthing went worng please check', error })
    }
}


const authorization = async (req, res) => {
    try {
        const worker = await workerModel.findOne({ _id: req.body.workerId })
        if (!worker) {
            return res
                .status(200).send({ message: 'worker does not Exist', success: false })
        } else {
            res.status(200).send({
                success: true, data: {
                    name: worker.firstName,
                    email: worker.email,
                    id: worker._id
                }
            })
        }
    } catch (error) {
        res.status(500)
            .send({ message: 'Error getting user info', success: false, error })
    }
}

const workerMoreDetails = async (req, res) => {
    
    try {
        if (!req.file) {
            console.log(req.body);
            return res.status(200).send({ message: 'No image uploaded', success: 'image' })
        }
        const moreData = await workerMoreDetailsModel.findOne({ worker_id: req.body.workerId })
        if (moreData) {
            return res.status(200).send({ message: 'worker already exist', success: false })
        }
        else if (req.body.firstName.trim().length === 0) {
            return res.status(200).send({ message: 'Space not allowed', success: 'firstName' })
        } else if (req.body.lastName.trim().length === 0) {
            return res.status(200).send({ message: 'space not allowed', success: 'lastName' })
        } else if (req.body.mobile.trim().length === 0 || req.body.mobile.length < 10 || req.body.mobile.length > 10) {
            return res.status(200).send({ message: 'please enter valid mobile nomber', success: 'mobile' })
        } else if (req.body.minBudget.trim().length === 0) {
            return res.status(200).send({ message: 'space not allowed', success: 'min' })
        } else if (req.body.discription.trim().length === 0) {
            return res.status(200).send({ message: 'Space not allowed', success: 'dis' })
        }
        else {
            const image = req.file.filename;
            await sharp("./uploads/workerImages/" + image)
                .resize(500, 500)
                .toFile("./uploads/profilImage/" + image)
            const data = await cloudinary.uploader.upload(
                "./uploads/profilImage/" + image
            );
            const cdnUrl = data.secure_url;
            const categoryData = await categoryModel.findOne({ name: req.body.category })
            const workerMoreData = new workerMoreDetailsModel({
                worker_id: req.body.workerId,
                category_id: categoryData._id,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                mobile: req.body.mobile,
                category: req.body.category,
                midBudjet: req.body.minBudget,
                availble: req.body.availability,
                discription: req.body.discription,
                image: cdnUrl
            })
            await workerMoreData.save();
            res.status(200).send({ message: 'successfulll', success: true })
        }
    } catch (error) {
        res.status(500).send({ message: 'somthing went wrong', success: false, error })
    }
}

const profileData = async (req, res) => {
    try {
        const workerMore = await workerMoreDetailsModel.findOne({ worker_id: req.body.workerId })
        console.log(workerMore);
        const mediaData = await mediaModel.aggregate([{ $unwind: '$videos' }, {
            $match: { workerId: req.body.workerId }
        }])
        const reviewData = await ratingModel.findOne({ worker_id: req.body.workerId })
        const personal = await workerModel.findById(req.body.workerId)
        console.log(personal);
        if (!workerMore) {
            return res.status(200).send({ message: 'No datas', success: false, personal: personal })
        }
        res.status(200).send({ message: 'worker datas get', success: true, data: workerMore, personal: personal, mediaData: mediaData, reviewData: reviewData  })
    } catch (error) {
        res.status(500).send({ message: 'somthing went wrong', success: false })
    }
}

const editProfile = async (req, res) => {
    try {
        if (req.file) {
            const image = req.file.filename;
            await sharp("./uploads/workerImages/" + image)
                .resize(500, 500)
                .toFile("./uploads/profilImage/" + image)
            const data = await cloudinary.uploader.upload(
                "./uploads/profilImage/" + image
            )
            const cdnUrl = data.secure_url;
            await workerMoreDetailsModel.updateOne({ worker_id: req.body.workerId },
                {
                    $set:
                    {
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        mobild: req.body.mobile,
                        category: req.body.category,
                        midBudjet: req.body.amount,
                        availble: req.body.availble,
                        discription: req.body.discription,
                        image: cdnUrl
                    }
                }
            )
            await workerModel.findByIdAndUpdate(req.body.workerId,
                {
                    $set:
                    {
                        firstName: req.body.firstName, lastName: req.body.lastName, mobile: req.body.mobile
                    }
                }
            )

        } else {
            await workerMoreDetailsModel.updateOne({ worker_id: req.body.workerId },
                {
                    $set:
                    {
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        mobild: req.body.mobile,
                        category: req.body.category,
                        midBudjet: req.body.amount,
                        availble: req.body.availble,
                        discription: req.body.discription,
                    }
                }
            )
            await workerModel.findByIdAndUpdate(req.body.workerId,
                {
                    $set:
                    {
                        firstName: req.body.firstName, lastName: req.body.lastName, mobile: req.body.mobile
                    }
                }
            )
        }
        res.status(200).send({ message: 'Profile updated', success: true })
    } catch (error) {
        res.status(500).send({ message: 'somthing went wrong', success: false })
    }
}

const notificationData = async (req, res) => {
    try {
        const moreData = await workerMoreDetailsModel.findOne({ worker_id: req.body.workerId })
        const notificationData = await notificationModel.findOne({ worker_id: req.body.workerId })
        if (!notificationData) {
            return res.status(200).send({ message: 'notificatications are Empty', success: false, profile: moreData })
        }
        const showDatas = notificationData.notifications.filter(trues => trues.status === true)
        res.status(200).send({ message: 'notification Data get', success: true, data: showDatas, profile: moreData })
    } catch (error) {
        res.status(500).send({ message: 'somthing went wrong', success: false })
    }
}

// booking Data
const bookingDatas = async (req, res) => {
    console.log("worker bookin");
    try {
        const bookingData = await bookingModel.findOne({ worker_id: req.body.workerId })
        const singleDatas = bookingData.orders.filter(datas => datas._id.toString() === req.body.booking_id)
        if (!bookingData) {
            return res.status(200).send({ message: 'Booking data getting fail', success: false })
        } else {
            res.status(200).send({ message: 'Booking data get success full', success: true, data: singleDatas })
        }
    } catch (error) {
        console.log(error, 'comes')
        res.status(500).send({ message: 'somthing went wrong', success: false })
    }
}
const allBookings = async (req, res) => {
    try {
        const bookingData = await bookingModel.aggregate([{ $unwind: "$orders" }, { $match: { worker_id: req.body.workerId } }])
        // const acceptedBookings = bookingData.orders.filter(order => order.status === 'Booked')
        if (!bookingData) {
            return res.status(200).send({ message: 'No bookings', success: false })
        }
        res.status(200).send({ message: 'Bookings get', success: true, data: bookingData })
    } catch (error) {
        res.status(500).send({ message: 'somthing went wrong', success: false })
    }
}

// booking accept and reject 
const acceptAndReject = async (req, res) => {
    try {
        if (req.body.id && req.body.email) {
            await bookingModel.updateOne({ worker_id: req.body.workerId, "orders._id": req.body.id }, { $set: { "orders.$.status": "Rejected" } })
            await notificationModel.updateOne({ worker_id: req.body.workerId, "notifications.booking_id": req.body.id }, { $set: { "notifications.$.status": false } })
            // editing
            const datas = await bookingModel.findOne({ worker_id: req.body.workerId })
            const users = datas.orders.filter((items) => items._id.toString() === req.body.id)
            const booking_id = users[0]._id
            const userNotificationData = await userNotificationModel.findOne({ user_id: req.body.user_id })
            if (userNotificationData) {
                await userNotificationModel.updateOne({ user_id: req.body.user_id },
                    {
                        $push:
                        {
                            notifications:
                            {
                                name: "your booking has been Rejected",
                                booking_id: booking_id,
                                Actions: 'Rejected',
                                timestamp: new Date(),
                            }
                        }
                    })
            } else {
                const notificationData = new userNotificationModel({
                    user_id: req.body.user_id,
                    notifications: [
                        {
                            name: "your booking has been Rejected",
                            booking_id: booking_id,
                            Actions: 'Rejected',
                            timestamp: new Date(),
                        }
                    ]
                })
                await notificationData.save()
            }
            // editing end
            const userNotification = await userNotificationModel.findOne({ user_id: req.body.user_id })
            res.status(200).send({ message: 'Booking has been rejected', success: true, userNotification: userNotification.notifications.length })
        } else {
            await bookingModel.updateOne({ worker_id: req.body.workerId, "orders._id": req.body.id }, { $set: { "orders.$.status": "Accepted" } })
            await notificationModel.updateOne({ worker_id: req.body.workerId, "notifications.booking_id": req.body.id }, { $set: { "notifications.$.status": false } })
            // Edited
            const datas = await bookingModel.findOne({ worker_id: req.body.workerId })
            const users = datas.orders.filter((items) => items._id.toString() === req.body.id)
            const booking_id = users[0]._id
            // sub edit
            const userNotificationData = await userNotificationModel.findOne({ user_id: req.body.user_id })
            if (userNotificationData) {
                await userNotificationModel.updateOne({ user_id: req.body.user_id },
                    {
                        $push:
                        {
                            notifications:
                            {
                                name: "your booking has been accepted",
                                booking_id: booking_id,
                                Actions: 'Accepted',
                                timestamp: new Date(),
                            }
                        }
                    })
            } else {
                // sub edit end
                const notificationData = new userNotificationModel({
                    user_id: req.body.user_id,
                    notifications: [
                        {
                            name: "your booking has been accepted",
                            booking_id: booking_id,
                            Actions: 'Accepted',
                            timestamp: new Date(),
                        }
                    ]
                })
                await notificationData.save()
            }
            const userNotification = await userNotificationModel.findOne({ user_id: req.body.user_id })
            // Edited
            res.status(200).send({ message: 'Booking has been rejected', success: true, userNotification: userNotification.notifications.length })
        }
    } catch (error) {
        res.status(500).send({ message: 'somthing went wrong', success: false, })
    }
}



// posting videos
const createMedia = async (req, res) => {
    const { name, workerId } = req.body;

    let videosData = req.files.videos.map(video => ({
        video: '/' + video.path,
        name: name,
        createdAt: new Date(),
    }));

    try {
        const mediaData = await mediaModel.findOne({ workerId: workerId });
        if (!mediaData) {
            const createMediaResult = await mediaModel.create({
                workerId,
                videos: videosData
            });
            res.status(200).send({ message: 'Media created successfully', success: true, createMediaResult });
        } else {
            await mediaModel.findOneAndUpdate(
                { workerId: workerId },
                {
                    $push: {
                        videos: { $each: videosData },
                    },
                }
            );
            res.status(200).send({ message: 'Media updated successfully', success: true });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

const getBannerData = async (req, res) => {
    try {
        const bannerData = await bannerModel.find({ status: true })
       
        if (!bannerData) {
            return res.status(200).send({ message: 'not get Banner data', success: false })
        }
        const notificationData = await notificationModel.findOne({ worker_id: req.body.workerId })
        res.status(200).send({
            message: 'Banner data getting successfull', success: true, data: bannerData, notification: notificationData,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Somthing went wrong', success: false, error })
    }
}

// Cancel booking
const cancelBooking = async (req, res) => {
    try {
        await bookingModel.findOneAndUpdate({ 'orders._id': req.body.booking_id }, {
            $set: {
                "orders.$.status": "Cancel",
            }
        })
        const bookingData = await bookingModel.aggregate([

            {
                $unwind: '$orders'
            }, {
                $match: {
                    'orders._id': new mongoose.Types.ObjectId(req.body.booking_id)
                }
            }
        ]);
        const workerMore = await workerMoreDetailsModel.findOne({ worker_id: req.body.workerId })
        await userNotificationModel.updateOne({
            user_id: bookingData[0].orders.user_id
        },
            {
                $push:
                {
                    notifications:
                    {
                        name: `${workerMore.firstName} ${workerMore.lastName} cancelled your Booking`,
                        booking_id: req.body.booking_id,
                        Actions: 'Cancel',
                        timestamp: new Date(),
                    }
                }
            }
        )
        res.status(200).send({ message: 'Cancellation succuss full', success: true })
    } catch (error) {
        res.status(500).send({ message: '' })
    }
}


// partner- data

const partnerData = async (req, res) => {
    try {
        const bookingData = await bookingModel.aggregate([{ $unwind: '$orders' }, { $match: { 'orders.payment_id': req.body.id } }])
        const userData = await userModel.findOne({ _id: bookingData[0].orders.user_id })
        if (!userData) {
            return res.status(200).send({ message: 'user Datas are empty', success: false })
        }
        res.status(200).send({ message: 'User data get', success: true, data: userData, bookingData: bookingData })
    } catch (error) {
        res.status(500).send({ message: 'somthin went wrong ', success: false })
    }
}

// chat histry

const getChatHistory = async (req, res) => {
    try {
        const chatData = await chatModel.aggregate([{ $unwind: '$history' }, { $match: { room_id: req.body.id } }])
        if (!chatData) {
            return res.status(200).send({ message: 'No chat history', success: false })
        }
        res.status(200).send({ message: 'success full', success: true, chatData: chatData, userId: req.body.workerId })
    } catch (error) {
        res.status(500).send({ messasge: 'somthing went wrong', success: false })
    }

}

const dashbordData = async (req, res) => {
    try {
        const bookingData = await bookingModel.aggregate([{ $unwind: '$orders' }, { $match: { worker_id: req.body.workerId } }])
        const filteredData = bookingData.filter(item => item.orders.status === 'Booked' || item.orders.status === 'Completed' || item.orders.status === 'Complete' || item.orders.status === 'waiting fullPayment');
        const uniqueUserIds = [];
        bookingData.filter(item => {
            if (!uniqueUserIds.includes(item.orders.user_id)) {
                uniqueUserIds.push(item.orders.user_id);
                return true;
            }
            return false;
        });
        if (!filteredData || filteredData.length < 1) {
            return res.status(200).send({ message: 'Booking Datas Empty', success: false })
        }
        res.status(200).send({ message: 'get all booking datas ', success: true, data: filteredData, userData: uniqueUserIds })
    } catch (error) {
        res.status(500).send({ message: 'somthing went wrong ', success: false })
    }
}

const chathistorys = async (req, res) => {
    try {
        const bookingData = await bookingModel.aggregate([{ $unwind: '$orders' },
        { $match: { 'orders.status': 'Booked', worker_id: req.body.workerId } },
        { $project: { _id: 0, 'orders.user_id': 1, 'orders.payment_id': 1 } }])
        if (!bookingData || bookingData.length < 1) {
            return res.status(200).send({ message: 'No chat history', success: false })
        }
        res.status(200).send({ message: 'Chat history', success: true, chat: bookingData })
    } catch (error) {
        res.status(500).send({ message: 'somthing went wrong', success: false })
    }
}
const contact = async (req, res) => {
    try {
        var usersData = []
        for (let i = 0; i < req.body.length; i++) {
            const userData = await userModel.findOne({ _id: req.body[i].orders.user_id })
            usersData.push({
                ...userData.toObject(),
                payment_id: req.body[i].orders.payment_id
            });

        }
        if (usersData.length < 0) {
            return res.status(200).send({ message: 'somthing went wrong', success: false })
        }
        res.status(200).send({ message: 'contact get', success: true, data: usersData })

    } catch (error) {
        res.status(500).send({ messag: 'somting went wrong', success: false })
    }
}




module.exports = {signUp,
                  login,
                  forgotPassword,
                setPassword,
                authorization,
            profileData,
            workerMoreDetails,
            notificationData,
            editProfile,
            bookingDatas,
            allBookings,
            acceptAndReject,
            createMedia,
            getBannerData,
            cancelBooking,
            partnerData,
            getChatHistory,
            dashbordData,
            chathistorys,
            contact
            
           
           
        }