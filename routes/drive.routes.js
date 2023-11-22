const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User.model");
const ImageData = require("../models/dall.model");

const ejs = require("ejs");
const router = express.Router();
const OpenAI = require("openai");
const dall = require("../classes/VanillaImageGenerator.class.js");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");

router.get("/", isLoggedIn, async (req, res) => {
  try {
    const user = req.session.currentUser;
    const id = user._id;

    // console.log(id);
    const images = await User.findById(id).populate("images");

    //console.log(images.createdAt)

    res.render("swiss-knife-drive/swissKnifeDrive", { images });
  } catch (error) {
    console.log(error);
  }
});
router.post("/erase/:id", isLoggedIn, async (req, res,next) => {
  try {
    const imageId = req.params.id;
    console.log(imageId);
    // Perform the deletion
    const imgdelete= await ImageData.findByIdAndDelete(imageId);

    // Redirect to the knife-drive page after deletion
    res.redirect("/drive");
  } catch (error) {

    
    console.log(error);
  
  }
});

module.exports = router;
