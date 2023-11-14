const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");
const Thread = require("../models/Thread.model.js");
const threadMessages = require("../models/ThreadMessages.model.js");
const threadClass = require("../classes/Thread.class.js")

const openaiApikey = process.env.OPENAI_API_KEY;
let userId = "";
const thread = new threadClass(openaiApikey);



router.get("/thread", isLoggedIn, async (req, res) => {
    try {
        userId = req.session.currentUser._id;
        const openThreads = await thread.listThreads(userId)

        res.render("profile/thread", {
            threadId: openThreads[0] ? openThreads[0].id : "No open threads.", 
            openThreads
        });
    } catch (error) {
        console.log(error)
    }
});


router.post("/thread/createThread", isLoggedIn, async (req, res, next) => {
    try {
        const message = req.body.message;
        const createdThread = await thread.createThread(message);

        const newThread = await Thread.create({
            threadId: createdThread.id,
            userId: userId,
        });

        await threadMessages.create({
            threadId: createdThread.id,
            thread_db_reference_id: newThread._id,
            message: message,
            userId: userId,
        });

        res.redirect("/thread")
    } catch (error) {
        console.error('Error creating assistant:', error);
        next(error);
    }
})


router.post("/thread/loadMessages", isLoggedIn, async (req, res, next) => {
    try {
        const threadId = req.body.thread_id;
        const threadMessages = await thread.listMessages(threadId);
        console.log(threadMessages.data[0].content[0].text.value)

        res.render("profile/thread", {threadMessages})
    } catch (error) {
        console.error('Error creating assistant:', error);
        next(error);
    }
})


router.get("/thread/delete/:id", isLoggedIn, async (req, res, next) => {
    const threadId = req.params.id;

    try {
        const deletedThread = await thread.deleteThread(threadId);
        await Thread.findOneAndDelete({ threadId })
        res.redirect('/thread')
    } catch (error) {
        console.error('Error deleting assistant:', error);
        next(error);
    }
})

module.exports = router;