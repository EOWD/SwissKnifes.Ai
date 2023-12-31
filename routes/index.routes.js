const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/documentation", isLoggedIn, (req, res, next) => {
  res.render("documentation");
});

router.get("/about-us", (req, res, next) => {
  res.render("about-us");
});


module.exports = router;
