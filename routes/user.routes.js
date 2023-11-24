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

  const currentUser =  req.session.currentUser
  const email = currentUser.email;
  res.render("profile/profile", { userInSession: req.session.currentUser ,email});
});

router.post('/update',isLoggedIn, async (req, res) => {
  try {
    const currentUser = await req.session.currentUser
    const userId = req.session.currentUser._id; 
const email = currentUser.email;
const username = req.body.username;
const emailNew = req.body.email
    const user = await User.findByIdAndUpdate(
      userId,
      { username, emailNew },
      { new: true } // To return the updated document
    );

  

 

    await user.save();

    res.redirect('/user/profile'); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the profile.' });
  }
});


  
  router.post("/logout", (req, res, next) => {
    req.session.destroy((err) => {
      if (err) next(err);
      res.redirect("/");
    });
  });
module.exports = router;
