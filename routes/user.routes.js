const express = require("express");
const ejs = require('ejs');
const router = express.Router();
const OpenAI = require("openai");
const dall = require("../classes/VanillaImageGenerator.class.js")
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const User = require("../models/User.model")
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");

router.get("/profile", isLoggedIn, (req, res, next) => {

  const currentUser = req.session.currentUser
  const email = currentUser.email;
  res.render("profile/profile", { userInSession: req.session.currentUser, email });
});

router.post('/update', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.currentUser._id;
    const currentUser = await User.findById(userId);

    const updateData = {
      username: req.body.username || currentUser.username,
      email: req.body.email || currentUser.email
    };

    if (currentUser.username === updateData.username && currentUser.email === updateData.email) {
      return res.render("error", {
        error: "Please update at least one profile setting to proceed with the update!"
      });
    }

    await User.findByIdAndUpdate(userId, updateData, { new: true });

    req.session.destroy((err) => {
      if (err) next(err);
      res.redirect("/");
    });
  } catch (error) {
    if(error.codeName === "DuplicateKey") {
      res.render("error", { error: 'The Username or E-Mail you tried to use is already taken.' });
    } else {
      res.render("error", { error: `Something went wrong: ${error}` });
    }
    
  }
});


router.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) next(err);
    res.redirect("/");
  });
});

module.exports = router;
