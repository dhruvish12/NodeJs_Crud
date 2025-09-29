// imports
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session  = require("express-session");
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// DB connection
const connectDB = async(DB_URL) => {
    try {
        const conn = await mongoose.connect(DB_URL);
        console.log(`database connected successfully : ${conn.connection.host}`);
    } catch (error) {
        console.log("Error while connecting to Database", error);
    }
};

connectDB(process.env.DB_URI);

// middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
    secret: "my secret key",
    saveUninitialized: true,
    resave: false,
}));

app.use((req, res, next) =>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.use(express.static('uploads'));

// FIX HERE ✅
app.set('view engine', 'ejs');

// routes
app.use("", require("./routes/routes"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// server
app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
});
