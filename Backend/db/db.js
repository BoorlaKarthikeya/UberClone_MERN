const mongoose = require('mongoose');

function connectToDb() {
    mongoose.connect(process.env.DB_CONNECT).then(() => {
        console.log("Connected to MongoDB Atlas");
    }).catch(err => {
        console.error("Error connecting to MongoDB:", err.message);
        console.error("Stack trace:", err.stack);
    });
}

module.exports = connectToDb;
