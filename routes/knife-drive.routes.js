const express = require("express");
const drive = require("../models/knifeDrive.model");
const multer = require("multer");
const path = require("path");
const Vision = require("../classes/Vision.class.js");
const Chat = require("../classes/chatbot.class.js");
const fs = require("fs");
const { createReadStream } = fs;
const mongoose = require("mongoose");
const { Readable } = require("stream");
const User = require("../models/User.model");
const Edit = require("../models/dallEdit.model");
const ImageData = require("../models/dall.model");
const Voice = require("../models/textToSpeech.model");
const VElement = require("../models/vision.model");

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

router.get("/session", isLoggedIn, async (req, res, next) => {
  try {
    const currentUser = await req.session.currentUser._id;
    const driveSession = await drive.create({
      userId: currentUser,
    });
    const sessionId = driveSession._id;
    await User.updateOne(
      { _id: currentUser },
      { $push: { knifeDrive: sessionId } }
    );

    console.log(currentUser);
    res.render("swiss-knife-drive/swissKnifeDrive");
  } catch {
    res.send;
  }
});

router.get("/", isLoggedIn, async (req, res, next) => {
  try {
    const currentUser = await req.session.currentUser._id;
    const imagesD = await User.findById(currentUser).populate("images");
    const visionD = await User.findById(currentUser).populate("visions");

    const voicesD = await User.findById(currentUser).populate("voiceMemo");

    res.render("swiss-knife-drive/swissKnifeDrive", {
      imagesD,
      visionD,
      voices: voicesD.voiceMemo,
    });
  } catch {
    res.send;
  }
});

router.post("/knife", async (req, res, next) => {
  //const isLoading = res.locals.isLoading;
  //res.send(`Loading: ${isLoading ? 'true' : 'false'}`);
  try {
    const { prompt, model, num, quality, size, style } = req.body;
    //console.log(model);
    const currentUser = await req.session.currentUser._id;

    const imagesD = await User.findById(currentUser).populate("images");
    const visionD = await User.findById(currentUser).populate("visions");

    const voicesD = await User.findById(currentUser).populate("voiceMemo");

    const number = +num;

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
    /*const user = await User.findById(currentUser);
    const driveSession = user.knifeDrive[0];
    await drive.findOneAndUpdate(
      { _id: driveSession },
      { $push: { dall: newImage._id } }
    );*/
    await User.updateOne(
      { _id: currentUser },
      { $push: { images: newImage._id } }
    );
    const status = data ? true : false;
    await User.findById(currentUser).populate("images");
    const images = await User.findById(currentUser).populate("images");
    const vision = await User.findById(currentUser).populate("visions");
    const voice = await User.findById(currentUser).populate("voiceMemo");
    res.render("swiss-knife-drive/swissKnifeDrive", {
      imageUrl: `data:image/png;base64,${data.b64_json}`,
      prompt,
      size,
      newImageId,
      showSpinner: false,
      status,
      images,
      voice,
      vision,
      imagesD,
      visionD,
      voices: voicesD.voiceMemo,
    });

    // const binaryData = Buffer.from(data, 'base64');
    //console.log(binaryData)
  } catch (error) {
    if (
      error.status === 400 &&
      error.message.includes("The size is not supported by this model.")
    ) {
      // Render a specific error message for the size not supported by the model
      return res.render("swiss-knife-drive/swissKnifeDrive", {
        message:
          "The selected size is not supported by the model. Please choose a different size.",
      });
    } else if (
      error.status === 400 &&
      error.message.includes("You must provide a prompt.")
    ) {
      // Render a specific error message for the size not supported by the model
      return res.render("swiss-knife-drive/swissKnifeDrive", {
        message: "You must provide a prompt.",
      });
      // For other errors, you can render a generic error message
    }else if (
      error.status === 429 &&
    error.message.includes('You exceeded your current quota, please check your plan and billing details.')
    ){

      return res.render("swiss-knife-drive/swissKnifeDrive", {
        message: "We are experiencing high demand, try again later.",})
    }else {
      console.log(error);
      return res.render("profile/image-generator", {
        message: "Something is of, give it another shot",
      });
    }
  }
});
router.post(
  "/upload",
  isLoggedIn,
  upload.single("image1"),
  async (req, res) => {
    try {
      const currentUser = await req.session.currentUser._id;
      const imagesD = await User.findById(currentUser).populate("images");
      const visionD = await User.findById(currentUser).populate("visions");

      const voicesD = await User.findById(currentUser).populate("voiceMemo");

      console.log(currentUser);
      let imageBuffer;

      // Check if Multer successfully processed the file
      if (req.file) {
        imageBuffer = req.file.buffer;
      } else {
        return res.status(400).send("No file uploaded");
      }

      const prompt = req.body.userPromptText;
      const base64 = imageBuffer.toString("base64");

      const vision = new Vision(prompt, base64);
      const response = await vision.generate();
      const data = response.choices[0].message.content;

      const vElem = await VElement.create({
        userId: currentUser,
        image: base64,
        response: data,
      });
      try {
        await User.updateOne(
          { _id: currentUser },
          { $push: { visions: vElem._id } }
        );
        await User.findById(currentUser).populate("visions");
      } catch (e) {
        console.log(e);
      }

      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        input: data,
        voice: "nova",
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      const base64Audio = buffer.toString("base64");
      console.log(buffer);

      const status = data ? true : false;

      res.render("swiss-knife-drive/swissKnifeDrive", {
        res: response.choices[0].message.content,
        imagesD,
        visionD,
        voices: voicesD.voiceMemo,
        data: `data:audio/mpeg;base64,${base64Audio}`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

/*router.post("/upload", upload.single("image1"), async (req, res) => {
  try {
    // Check if Multer successfully processed the file
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }
    const prompt = req.body.userPromptText;
    // Access the buffer of the uploaded file
    const imageBuffer = req.file.buffer;

    // Process the file as needed (e.g., convert to base64)
    const base64 = imageBuffer.toString("base64");
    //console.log(base64)
    const vision = new Vision(prompt, base64);
    const response = await vision.generate();
    console.log(response.choices[0].message.content);
    res.render("swiss-knife-drive/swissKnifeDrive", {
      res: response.choices[0].message.content,
    });
    // Do something with the base64 data, such as saving it to a database or sending a response
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }

  // ... process the file and handle vision generation ...

  try {
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
   {console.log(err)}
});*/

router.post("/text-to-speech", isLoggedIn, async (req, res, next) => {
  try {
    const currentUser = await req.session.currentUser._id;
    const imagesD = await User.findById(currentUser).populate("images");
    const visionD = await User.findById(currentUser).populate("visions");

    const voicesD = await User.findById(currentUser).populate("voiceMemo");

    const { voice, text } = req.body;

    try {
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        input: text,
        voice: voice,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      const base64Audio = buffer.toString("base64");
      console.log(buffer);
      // Create a new document in the Voice model with the binary data
      const newVoice = await Voice.create({
        userId: currentUser,
        prompt: text,
        audioData: base64Audio,
      });
      try {
        await User.updateOne(
          { _id: currentUser },
          { $push: { voiceMemo: newVoice._id } }
        );
        await User.findById(currentUser).populate("visions");
      } catch (e) {
        console.log(e);
      }
      // Render the view and pass the filename of the saved speech file
      res.render("swiss-knife-drive/swissKnifeDrive", {
        audio: `data:audio/mpeg;base64,${base64Audio}`,
        voiceId: newVoice._id,
        imagesD,
        visionD,
        voices: voicesD.voiceMemo,
      });
    } catch (error) {
      console.error("OpenAI API error:", error);
      res.render("errorPage", { message: "Error generating speech." }); // Replace 'errorPage' with your actual error view
    }
  } catch (err) {
    console.error(err);
    res.render("errorPage", { message: "Server error." }); // Replace 'errorPage' with your actual error view
  }
});

router.post("/download-audio", async (req, res) => {
  const voiceId = req.body.voiceId; // Get the voice ID from the request body

  try {
    const voiceData = await Voice.findById(voiceId);
    if (!voiceData) {
      return res.status(404).send("Audio not found");
    }

    const audioBuffer = Buffer.from(voiceData.audioData, "base64");

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=audio_${voiceId}.mp3`
    );
    res.send(audioBuffer);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

const sharp = require("sharp");
const { response } = require("../app.js");

router.post(
  "/dallEdit",
  upload.single("image"),
  isLoggedIn,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send("No image uploaded.");
      }

      const imageBuffer = req.file.buffer;
      const { prompt, imageSize } = req.body;

      // Convert the 'RGB' image to 'RGBA' format
      const rgbaImageBuffer = await sharp(imageBuffer)
        .ensureAlpha() // Ensure that the image has an alpha channel for transparency
        .toFormat("png") // Convert the image to PNG format ('RGBA' format)
        .toBuffer();
      const imageFile = await OpenAI.toFile(rgbaImageBuffer);
      // Get the dimensions of the converted image
      const imageMetadata = await sharp(rgbaImageBuffer).metadata();
      const imageWidth = imageMetadata.width;
      const imageHeight = imageMetadata.height;

      // Create an empty PNG mask with the same dimensions in memory
      const emptyMaskBuffer = await sharp({
        create: {
          width: imageWidth,
          height: imageHeight,
          channels: 4, // 4 channels for RGBA with transparency
          background: { r: 0, g: 0, b: 0, alpha: 0 }, // Fully transparent
        },
      })
        .png()
        .toBuffer();
      const empty = await OpenAI.toFile(emptyMaskBuffer);
      const response = await openai.images.edit({
        image: imageFile, // Use the converted 'RGBA' image

        model: "dall-e-2",
        prompt: prompt,
        n: 1,
        size: imageSize || "1024x1024",
        response_format: "url",
      });

      const imageUrl = response.data[0].url;
      console.log("Edited image URL:", imageUrl);
      res.json({ imageUrl });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("An error occurred.");
    }
  }
);

router.post("/chat", isLoggedIn, async (req, res) => {
  try{
  const currentUser = await req.session.currentUser._id;
  const imagesD = await User.findById(currentUser).populate("images");
  const visionD = await User.findById(currentUser).populate("visions");

  const voicesD = await User.findById(currentUser).populate("voiceMemo");

  const { prompt, innovation, enhancer } = req.body;
  const dall =
    "your name is Drive and you talk back as if you are a human and your reply in natural language  a prompt for a photo generation picture based on the users suggested message ";
  console.log(prompt, innovation);
  const inNum = +innovation;

  const chat = new Chat(`${prompt}`, inNum);
  const response = await chat.generate();
  const update = response ? true : false;
  

  res.render("swiss-knife-drive/swissknifedrive", {
    response,
    update,
    imagesD,
    visionD,
    voices: voicesD.voiceMemo,
  });

}catch (err) {
  console.log (err)
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

router.post("/erase/:id", isLoggedIn, async (req, res, next) => {
  try {
    const currentUser = await req.session.currentUser._id;
    const imagesD = await User.findById(currentUser).populate("images");
    const visionD = await User.findById(currentUser).populate("visions");

    const voicesD = await User.findById(currentUser).populate("voiceMemo");
    const imageId = req.params.id;
    console.log(imageId);
    // Perform the deletion

    await ImageData.findByIdAndDelete(imageId);

    await Voice.findByIdAndDelete(imageId);

    await Vision.findByIdAndDelete(imageId);

    // Redirect to the knife-drive page after deletion
    res.redirect("/knifedrive/");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
