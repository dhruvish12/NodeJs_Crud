const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');

var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null,"./uploads");
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname + "_" + file.originalname);
    },
});

var uploads = multer({
    storage: storage,
}).single("image");

router.post('/add', uploads, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,   // 👈 fixed typo (phon → phone)
            image: req.file ? req.file.filename : null, // handle no file case
        });

        await user.save(); // ✅ save without callback

        req.session.message = {
            type: "success",
            message: "User Added Successfully",
        };

        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.json({ message: err.message, type: 'danger' });
    }
});

router.get("/", async (req, res) => {
    try {
        const users = await User.find(); // no exec(), no callback
        res.render("index", {
            title: "Home Page",
            users: users,
            message: req.session.message || null,
            baseUrl: req.app.locals.baseUrl,
        });
        req.session.message = null; // clear flash message after showing
    } catch (err) {
        res.json({ message: err.message });
    }
});

router.get("/add",(req,res) =>{
    res.render("add",{title: "Add User"})
})

router.get("/edit/:id", async (req, res) => {
    try {
        let id = req.params.id;
        let user = await User.findById(id);

        if (!user) {
            return res.redirect("/");
        }

        res.render("edit", {
            title: "Edit User",
            user: user
        });
    } catch (err) {
        console.error(err);
        res.redirect("/");
    }
});

router.post("/update/:id", uploads, async (req, res) => {
    try {
        let id = req.params.id;
        let user = await User.findById(id);

        if (!user) {
            return res.redirect("/");
        }
        user.name = req.body.name;
        user.email = req.body.email;
        user.phone = req.body.phone;
        if (req.file) {
            user.image = req.file.filename;
        }
        await user.save();
        req.session.message = {
            type: "success",
            message: "User Updated Successfully",
        };
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.json({ message: err.message, type: 'danger' });
    }
});

router.get("/delete/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let user = await User.findByIdAndDelete(id); // ✅ use findByIdAndDelete

    if (!user) {
      return res.redirect("/");
    }

    req.session.message = {
      type: "success",
      message: "User Deleted Successfully",
    };

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.json({ message: err.message });
  }
});


module.exports = router;