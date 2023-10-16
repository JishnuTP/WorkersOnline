const express = require('express');
const adminRoute = express();
const adminController = require('../Controllers/adminController');
const adminAuthmiddleware = require('../Middlewares/adminAuthmiddleware');
const upload = require('../Config/multer')


adminRoute.post('/login', adminController.login)
adminRoute.post('/forgotpassword', adminController.forgotPassword);
adminRoute.post('/setpassword', adminController.setPassword);
adminRoute.post('/get-admin-info-by-id', adminAuthmiddleware, adminController.authorization);
adminRoute.post('/addcategory', adminController.addcategory)
adminRoute.post('/get-category-data', adminController.getCategoryData)
adminRoute.patch('/category-list-unlist', adminController.listAndUnlistCategory)
adminRoute.post('/get-worker-data', adminController.workerList)
adminRoute.patch('/block-and-unblock-worker', adminController.worker_Block_And_Unblock);
adminRoute.post('/get-user-data', adminController.userList);
adminRoute.patch('/block-and-unblock', adminController.blockAndUnblock)
adminRoute.get('/get-booking-data', adminAuthmiddleware, adminController.bookingDatas)
adminRoute.post('/get-worker-more-data', adminAuthmiddleware, adminController.getWorkerMoreData)
adminRoute.post('/addbanner', upload.upload.single('image'), adminAuthmiddleware, adminController.addbanner)
adminRoute.post('/get-banner-data', adminController.getBannerData)
adminRoute.get('/dash-bord-data', adminAuthmiddleware, adminController.dashBoardData)
adminRoute.patch('/banner-list-unlist', adminController.bannerListAndUnlist)


module.exports = adminRoute