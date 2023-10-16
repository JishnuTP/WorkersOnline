const express = require('express');
const userRoute = express();
const userController = require("../Controllers/userController")
const sessionConfig = require('../Config/sessionConfig')
const authMiddileware = require('../Middlewares/authMiddleware');
const upload = require('../Config/userMulter')
const session = require('express-session')

// userRoute.use(session({
//     secret: sessionConfig.sessionSecret,
//     saveUninitialized: true,
//     resave: false
// }))

userRoute.post('/signup', userController.signUp);
userRoute.post('/otp', userController.otp);
userRoute.post('/login', userController.login);
userRoute.post('/googlelogin', userController.googlelogin);
userRoute.post('/forgot', userController.forgot)
userRoute.post('/setpassword', userController.setPassword)
userRoute.post('/get-user-info-by-id', authMiddileware, userController.authorization);
userRoute.post('/user_profiledata', authMiddileware, userController.profile)
userRoute.post('/edit-profile', upload.upload.single('image'), authMiddileware, userController.editProfile)
userRoute.post('/get-worker-data', authMiddileware, userController.getWorkerMoreData)
userRoute.post('/worker-view', authMiddileware, userController.workerView);
userRoute.post('/bookworker', authMiddileware, userController.workerBooking)
userRoute.get('/get-booking-data', authMiddileware, userController.bookingData);
userRoute.post('/notifications', authMiddileware, userController.userNotification)
userRoute.post('/confirm_booking_data', authMiddileware, userController.confirmBookingData)
userRoute.post('/advance-payment', authMiddileware, userController.advancePayment);
userRoute.post('/verifiy-payment', authMiddileware, userController.verifyPayment)
userRoute.post('/cancel-swal', authMiddileware, userController.cancelSwal)
userRoute.patch('/cancel-booking', authMiddileware, userController.cancelBooking)
userRoute.get('/full-payment-notificaions', authMiddileware, userController.notificationCreate)
userRoute.patch('/full-payment', authMiddileware, userController.fullpaymentDone)
userRoute.patch('/verify-full-payment', authMiddileware, userController.verifyFullPayment)
userRoute.post('/full-payment-booking', authMiddileware, userController.fullPayment)
userRoute.get('/get-userNotificaions', authMiddileware, userController.getNotifications)
userRoute.post('/all-media', authMiddileware, userController.allMedia)
userRoute.get('/review-notificaion', authMiddileware, userController.reviewNotification)
userRoute.post('/review', authMiddileware, userController.writeReview)

userRoute.post('/partner-data', authMiddileware, userController.partnerProfileData)
userRoute.get('/getAll-post', authMiddileware, userController.allPost)
userRoute.get('/chat-historys', authMiddileware, userController.chathistorys)
userRoute.post('/chat-history', authMiddileware, userController.getChatHistory)
userRoute.post('/contact', authMiddileware, userController.contact)
userRoute.post('/get-home-banner-data', authMiddileware, userController.getBannerData)


module.exports = userRoute  