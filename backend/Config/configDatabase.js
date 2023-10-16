const mongoose = require('mongoose')
mongoose.connect(process.env.mongoUrl)
const connection = mongoose.connection
connection.on('connected', () => console.log('mongodb has been connected'))
connection.on('error', (error) => console.log('mongodb connection  fail', error))
module.exports = mongoose
