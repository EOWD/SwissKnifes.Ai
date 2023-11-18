const express = require("express");
const multer = require("multer");
const path = require("path");
const Vision = require("../classes/Vision.class.js");
const fs = require("fs");
const mongoose = require("mongoose");
const User = require("../models/User.model");
const ImageData = require("../models/dall.model");
const { PassThrough } = require("stream");
const router = express.Router();
const OpenAI = require("openai");
const dall = require("../classes/VanillaImageGenerator.class.js");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");

// Set up Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", isLoggedIn, async (req, res, next) => {
  try {
    const passThrough = new PassThrough();

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Disposition", "inline; filename=speech.mp3");

    passThrough.pipe(res);
          
    try {
      const speechFile = path.resolve("./speech.mp3");
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        input: "Today is a wonderful day to build something people love!",
        voice: "alloy",
      });
            
      console.log(speechFile);
      const buffer = Buffer.from(await mp3.arrayBuffer());
      //await fs.promises.writeFile(speechFile, buffer);
      // Handle the API response
      console.log(buffer);
      const file = passThrough.end(buffer);
      res.render("profile/knife-vision", { file: file });
    } catch (error) {
      console.error("OpenAI API error:", error);
    }
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;
