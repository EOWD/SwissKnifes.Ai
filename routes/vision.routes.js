const express = require("express");
const multer = require('multer');

const Vision = require("../classes/Vision.class.js");
const fs=require("fs");
const mongoose = require("mongoose");
const User = require("../models/User.model");
const ImageData = require("../models/dall.model");
const base64js = require('base64-js');
const ejs = require("ejs");
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



router.get("/", isLoggedIn, async(req, res, next) => {
try {
   
 res.render("profile/knife-vision")

}catch(err) {
    console.log(err)
}


});
router.post("/upload", upload.single("image1"), async (req, res) => {
    try {
      // Check if Multer successfully processed the file
      if (!req.file) {
        return res.status(400).send("No file uploaded");
      }
  const prompt= req.body.userPromptText
      // Access the buffer of the uploaded file
      const imageBuffer = req.file.buffer;
  
      // Process the file as needed (e.g., convert to base64)
      const base64 = imageBuffer.toString("base64");
      //console.log(base64)
      const vision = new Vision(prompt, base64);
      const response = await vision.generate();
      console.log(response.choices[0].message.content);
res.send (response.choices[0].message.content)
      // Do something with the base64 data, such as saving it to a database or sending a response
    
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }

    // ... process the file and handle vision generation ...

    
   
 
    /*try {
        const { userPromptText } = req.body;
        console.log(userPromptText);

        // The uploaded file is available in req.file.buffer
        const imageBuffer = req.file.buffer;
        const image1Base64 = base64js.fromByteArray(imageBuffer);
        console.log(image1Base64);

        const vision = new Vision(userPromptText, image1Base64);
        const response = await vision.generate();
        console.log(response.choices[0].message.content);

        res.send("File uploaded and vision generated successfully");
    }catch(err)
     {console.log(err)}*/



    });





module.exports = router;
