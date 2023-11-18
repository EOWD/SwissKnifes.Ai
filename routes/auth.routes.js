const express = require("express");
const router = express.Router();
const bcryptjs = require("bcryptjs");
const User = require("../models/User.model");
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");
const mongoose = require("mongoose");

router.get("/signup", isLoggedOut, (req, res, next) => {
  res.render("auth/signup");
});

router.post("/signup", async (req, res, next) => {
  const { email, password, name } = req.body;
  if (!name || !email || !password) {
    res.render("auth/signup", {
      errorMessage:
        "All fields are mandatory. Please provide your username, email and password.",
    });
    return;
  } else {
    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!regex.test(password)) {
      res
        .status(500)
        .render('auth/signup', { errorMessage: 'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.' });
      return;
    }
    try {
      const salt = bcryptjs.genSaltSync(12);
      const hashedPassword = bcryptjs.hashSync(password, salt);

      const user = await User.findOne({ email });
      if (user) {
        res.render("auth/signup", {
          errorMessage: "User already exists!",
        });
      } else {
        await User.create({
          username: name,
          email,
          password: hashedPassword,
        });

        console.log(`Password hash: ${hashedPassword}`);
        res.redirect("/auth/login");
      }
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(500).render("auth/signup", { errorMessage: error.message });
      } else {
        console.log(error);
      }
    }
  }
});

router.get("/login", isLoggedOut, (req, res, next) => {
  res.render("auth/login");
});

router.post("/login", async (req, res, next) => {
  console.log("SESSION =====> ", req.session);
  const logInError = "Wrong email or password";
  try {
    console.log(req.body.password);
    const { emailOrName, password } = req.body;

    const user = await User.findOne({$or: [{ email: emailOrName } && {username: emailOrName}]});

    console.log(user);

    if (user) {
      const isMatch = bcryptjs.compareSync(password, user.password);
      if (isMatch) {
        req.session.currentUser = user;
        console.log("match");
        res.redirect("/user/profile");
      } else {
        res.render("auth/login", { logInError });
      }
    } else {
      res.render("auth/login", { logInError });
    }
    const currentUser = await req.session.currentUser._id;
    const driveSession = await drive.create({
      userId: currentUser,
    
    });
  } catch (error) {
    console.log("log in error", error);
  }
});

module.exports = router;
