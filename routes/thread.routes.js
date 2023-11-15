const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");
const Thread = require("../models/Thread.model.js");
const threadMessages = require("../models/ThreadMessages.model.js");
const threadClass = require("../classes/Thread.class.js")
const VanillaAssistant = require('../classes/Assistant.class.js');

const openaiApikey = process.env.OPENAI_API_KEY;
const assistantInstance = new VanillaAssistant(openaiApikey);
let userId = "";
const thread = new threadClass(openaiApikey);



router.get("/thread", isLoggedIn, async (req, res) => {
    try {
        userId = req.session.currentUser._id;
        const listAllAssistants = await assistantInstance.listAssistants();
        const openThreads = await thread.listThreads(userId)
        if(openThreads[0]){
            res.redirect(`/thread/${openThreads[0].threadId}`)
        } else {
            res.render("profile/thread", {listAllAssistants})
        }
    } catch (error) {
        console.log(error)
    }
});

router.get("/thread/:threadId", isLoggedIn, async (req, res) => {
    try {
        userId = req.session.currentUser._id;
        const listAllAssistants = await assistantInstance.listAssistants();
        const currentThread = req.params.threadId
        const currentThreadMessages = await thread.listMessages(currentThread)
        const openThreads = await thread.listThreads(userId)
        res.render("profile/thread", {currentThreadMessages, openThreads, currentThread, listAllAssistants})
    } catch (error) {
        console.log(error)
    }
});


router.post("/thread/createThread", isLoggedIn, async (req, res, next) => {
    try {
        userId = req.session.currentUser._id;
        const message = req.body.message;
        const assistantId = req.body.assistantId;
        const createdThread = await thread.createThreadAndRun(assistantId, message);
        const threadId = createdThread.thread_id;
        const runId = createdThread.id;

        const newThread = await Thread.create({
            threadId: createdThread.thread_id,
            userId: userId,
        });

        await threadMessages.create({
            thread_db_reference_id: newThread._id,
            role: "user",
            message: message,
            userId: userId,
        });

        let status = await thread.retrieveRun(threadId, runId);
        while (status.status != "completed") {
            await sleep(500);
            status = await thread.retrieveRun(threadId, runId);
            console.log(status.status)
        }

        if (status.status === 'completed') {
            res.redirect(`/thread/${threadId}`);
        }
    } catch (error) {
        console.error('Error creating assistant:', error);
        next(error);
    }
})


router.post("/thread/sendMessage", isLoggedIn, async (req, res, next) => {
    try {
        userId = req.session.currentUser._id;

        const threadId = req.body.currentThread
        const addMessage = await thread.createMessage(threadId, req.body.message)
        
        const threadDbId = await Thread.findOne({threadId})

        await threadMessages.create({
            thread_db_reference_id: threadDbId._id,
            role: "user",
            message: req.body.message,
            userId: userId,
        });

        res.redirect(`/thread/${threadId}`)
    } catch (error) {
        console.error('Error creating assistant:', error);
        next(error);
    }
    console.log(req.body)
})


router.post("/thread/loadMessages", isLoggedIn, async (req, res, next) => {
    try {
        const threadId = req.body.thread_id;
        const threadMessages = await thread.listMessages(threadId);

        res.render("profile/thread", {threadMessages})
    } catch (error) {
        console.error('Error creating assistant:', error);
        next(error);
    }
})


router.post("/thread/runThread", isLoggedIn, async (req, res, next) => {
    try {
        const runThread = await thread.runThread(req.body.currentThread, req.body.assistantId);
        let status = await thread.retrieveRun(req.body.currentThread, runThread.id);
        while (status.status != "completed") {
            await sleep(500);
            status = await thread.retrieveRun(req.body.currentThread, runThread.id);
            console.log(status.status)
        }

        if (status.status === 'completed') {
            res.redirect(`/thread/${req.body.currentThread}`);
        }

    } catch (error) {
        console.error('Error creating assistant:', error);
        next(error);
    }
})


router.get("/thread/delete/:id", isLoggedIn, async (req, res, next) => {
    const threadId = req.params.id;

    try {
        const getThreadDbId = await Thread.findOne({threadId});

        if (getThreadDbId) {
            const threadDbId = getThreadDbId._id;

            const deletedThread = await thread.deleteThread(threadId);
            await Thread.findOneAndDelete({ threadId });
            await threadMessages.deleteMany({ thread_db_reference_id: threadDbId });

            res.redirect('/thread');
        } else {
            console.log("Thread not found");
            res.redirect('/thread');
        }
    } catch (error) {
        console.error('Error deleting assistant:', error);
        next(error);
    }
})

module.exports = router;


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}