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
router.get("/img-knife", isLoggedIn, async (req, res, next) => {
  const users = await User.find();
  if (req.session.currentUser) {
    console.log("we have cookies");
  }
  //const user = req.session.currentUser
  const currentUser = req.session.currentUser._id;
  //const user = await User.findById(currentUser)
  //console.log(user);
  res.render("profile/image-generator", { users });
});

router.post("/img-knife", async (req, res, next) => {
  try {
    const { prompt, model, num, quality, size, style } = req.body;
    console.log(model);
    const currentUser = await req.session.currentUser._id;

    


    //console.log(user);

    const Dall = new dall({ prompt, model, quality, size, style });
    const response = await Dall.generate();

    console.log(response);
    const data = response.data[0].b64_json;
    //console.log(data);
   const newImage= await ImageData.create({
      userId: currentUser,
      prompt: prompt,
      imageData: data,

    });

    await User.updateOne(
        { _id: currentUser },
        { $push: { images: newImage._id } }
      );

    try {
       await User.findById(currentUser).populate("images");
        
        // Handle the populated user data or perform additional operations
        
      
      } catch (error) {
        // Handle errors
        console.error(error);
      }
    // const binaryData = Buffer.from(data, 'base64');
    //console.log(binaryData)

    res.render("profile/image-generator", {
      imageUrl: `data:image/png;base64,${data}`,
    });
  } catch (error) {
    // Handling errors and passing them to the next middleware
    next(error);
  }
});

module.exports = router;
