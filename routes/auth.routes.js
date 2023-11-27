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

router.get("/login", isLoggedOut,async (req, res, next) => {
  res.render("auth/login");
});

router.post("/login", async (req, res, next) => {
  try {
    const { emailOrName, password } = req.body;

    const user = await User.findOne({ $or: [{ email: emailOrName }, { username: emailOrName }] });

    if (!user) {
      return res.render("auth/login", { logInError: "User not found" });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.render("auth/login", { logInError: "Wrong email or password" });
    }

    req.session.currentUser = user;
    res.redirect("/");

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).render("auth/login", { logInError: "An error occurred" });
  }
});


module.exports = router;
