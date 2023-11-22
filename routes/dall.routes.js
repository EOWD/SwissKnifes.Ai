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
const { isLoggedIn, isLoggedOut,loadingMiddleware } = require("../middleware/route-guard.js");
router.get("/img-knife", isLoggedIn, async (req, res, next) => {
  const users = await User.find();
  if (req.session.currentUser) {
    console.log("we have cookies");
  }
  const user = req.session.currentUser;
  const currentUser = req.session.currentUser._id;
  //const user = await User.findById(currentUser)
  //console.log(user);
  //const x = await User.findById("654f74e52e3de811ef84cb84").populate("images");
  //console.log(x.images);
  res.render("profile/image-generator", { users });
});

router.post("/img-knife",loadingMiddleware, async (req, res, next) => {
  //const isLoading = res.locals.isLoading;
  //res.send(`Loading: ${isLoading ? 'true' : 'false'}`);
  try {
    const { prompt, model, num, quality, size, style } = req.body;
    //console.log(model);
    const currentUser = await req.session.currentUser._id;

    const number = +num;
    
    // console.log(number);

    //console.log(user);

    const Dall = new dall({ prompt, model, number, quality, size, style });
    const response = await Dall.generate();

    // console.log(response);
    const data = response.data[0];
    //console.log(data);
    const newImage = await ImageData.create({
      userId: currentUser,
      prompt: prompt,
      imageData: data.b64_json,
    });
    const newImageId = newImage.id;
    console.log(newImageId);
    await User.updateOne(
      { _id: currentUser },
      { $push: { images: newImage._id } }
    );

   
      await User.findById(currentUser).populate("images");
      
      res.render("profile/single-image", {
        imageUrl: `data:image/png;base64,${data.b64_json}`,
        prompt,
        size,
        newImageId,
 showSpinner:false,
      });
    
    // const binaryData = Buffer.from(data, 'base64');
    //console.log(binaryData)
  } catch (error) {
    if (
      error.status === 400 &&
      error.message.includes("The size is not supported by this model.")
    ) {
      // Render a specific error message for the size not supported by the model
      return res.render("profile/image-generator", {
        message:
          "The selected size is not supported by the model. Please choose a different size.",
      });
    } else if (
      error.status === 400 &&
      error.message.includes("You must provide a prompt.")
    ) {
      // Render a specific error message for the size not supported by the model
      return res.render("profile/image-generator", {
        message: "You must provide a prompt.",
      });
      // For other errors, you can render a generic error message
    } else {
      console.log(error)
      return res.render("profile/image-generator", {
        message: "Something is of, give it another shot",

      });
    }
  }
});

router.post("/download-image", async (req, res) => {
  const imageId = req.body.imageUrl;
  // console.log(imageId);
  //const image = imageId._id;
  //console.log(image)
  try {
    const imageData = await ImageData.findById(imageId);
    //console.log(imageData)
    const bs64 = imageData.imageData;
    console.log(bs64);
    const url = Buffer.from(bs64, "base64");

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", `attachment; filename=${imageId}.png`);
    res.send(url);
  } catch (error) {}
});
module.exports = router;
