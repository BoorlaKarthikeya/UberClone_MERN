const mongoose = require('mongoose');

function connectToDb() {
    mongoose.connect(process.env.DB_CONNECT).then(() => {
        console.log("Connected to MongoDB Atlas");
    }).catch(err => {
        console.error("Error connecting to MongoDB:", err);
        setTimeout(connectToDb, 5000); // Retry the connection after 5 seconds
    });
}

module.exports = connectToDb;
