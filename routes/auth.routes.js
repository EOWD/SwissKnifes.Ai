const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const User = require("../models/User.model");
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");

router.get("/signup", (req, res, next) => {
    res.render("auth/signup");
  });
  
  router.post("/signup", isLoggedIn , async (req, res, next) => {
    try {
      const { email, password, name } = req.body;
  
      const salt = bcryptjs.genSaltSync(12);
      const hashedPassword = bcryptjs.hashSync(password, salt);
  
      const user = await User.findOne({ email });
      if (user) {
        res.redirect("/auth/signup");
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
      console.log(error);
    }
  });

  router.get("/login", isLoggedOut, (req, res, next) => {
    res.render("auth/login");
  });

  
  router.post("/login", async (req, res, next) => {
    console.log("SESSION =====> ", req.session);
    const logInError="Wrong email or password";
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email: email });
  
      console.log(user);

      
      const isMatch = bcryptjs.compareSync(password, user.password);
      if (isMatch) {
        req.session.currentUser = user;
        console.log("match");
        res.redirect("/user/profile");
      } else {
        res.render("auth/login",{logInError});
      }
    } catch (error) {
      console.log("log in error", error);
    }
  });

module.exports = router;
