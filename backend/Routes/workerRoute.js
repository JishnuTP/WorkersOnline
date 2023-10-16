const express = require('express');
const workerRoute = express();
const session = require('express-session')
const workerController = require('../Controllers/workerController')
const sessionConfig = require('../Config/sessionConfig');
const workerAuthmiddileware = require('../Middlewares/workerAuthmiddleware')
const upload = require('../Config/multer')



workerRoute.post('/signup', workerController.signUp);
workerRoute.post('/login', workerController.login)
workerRoute.post('/forgotpassword', workerController.forgotPassword)
workerRoute.post('/setpassword', workerController.setPassword)
workerRoute.post('/get-worker-info-by-id', workerAuthmiddileware, workerController.authorization)
workerRoute.post('/get-profile-data',workerAuthmiddileware , workerController.profileData)
workerRoute.post('/worker-more-details', upload.upload.single('image'), workerAuthmiddileware, workerController.workerMoreDetails)
workerRoute.post('/get-notification-data', workerAuthmiddileware, workerController.notificationData)
workerRoute.post('/get-booking-data', workerAuthmiddileware, workerController.bookingDatas)
workerRoute.post('/get-all-booking-datas', workerAuthmiddileware, workerController.allBookings)
workerRoute.post('/accept_and_reject', workerAuthmiddileware, workerController.acceptAndReject)
workerRoute.post('/create-media', upload.mediaUpload.fields([
    {
        name: "videos", maxCount: 5,
    }
]),
    workerAuthmiddileware, workerController.createMedia)


workerRoute.patch('/edit-profile', upload.upload.single('image'), workerAuthmiddileware, workerController.editProfile);

workerRoute.get('/dashbord-data', workerAuthmiddileware, workerController.dashbordData)
workerRoute.get('/chat-historys', workerAuthmiddileware, workerController.chathistorys)
workerRoute.post('/contact', workerAuthmiddileware, workerController.contact)
workerRoute.post('/partner-data', workerAuthmiddileware, workerController.partnerData)
workerRoute.post('/get-workerhome-banner-data', workerAuthmiddileware, workerController.getBannerData)
workerRoute.post('/chat-history', workerAuthmiddileware, workerController.getChatHistory)
workerRoute.patch('/cancel-booking', workerAuthmiddileware, workerController.cancelBooking)

module.exports = workerRoute