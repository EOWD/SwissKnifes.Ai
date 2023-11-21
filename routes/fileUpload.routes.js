const express = require("express");
const router = express.Router();
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");

const openaiApikey = process.env.OPENAI_API_KEY;
let userId = "";


router.post("/thread/createThread", isLoggedIn, async (req, res, next) => {
    try {
        userId = req.session.currentUser._id;
        

    } catch (error) {
        console.error('Error uploading the file:', error);
        next(error);
    }
})