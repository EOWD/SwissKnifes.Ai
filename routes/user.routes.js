const express = require("express");
const ejs = require('ejs');
const router = express.Router();
const OpenAI = require("openai");
const dall = require("../classes/VanillaImageGenerator.class.js")
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");

router.get("/profile", isLoggedIn, (req, res, next) => {
  res.render("profile/profile", { userInSession: req.session.currentUser });
});


  
  router.post("/logout", (req, res, next) => {
    req.session.destroy((err) => {
      if (err) next(err);
      res.redirect("/");
    });
  });
module.exports = router;
