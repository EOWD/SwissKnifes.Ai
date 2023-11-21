const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");
const Thread = require("../models/Thread.model.js");
const threadMessages = require("../models/ThreadMessages.model.js");
const threadClass = require("../classes/Thread.class.js")
const VanillaAssistant = require('../classes/Assistant.class.js');
const threadSummarizer = require('../controller/threadSummarizer.js');

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
        const currentThreadTitle = await thread.findThread(currentThread)
        const notReversedThreadMessages = await thread.listMessages(currentThread)
        const currentThreadMessages = notReversedThreadMessages.data.reverse();
        let openThreads = await thread.listThreads(userId)

        openThreads.forEach(thread => {
            const assistant = listAllAssistants.find(assistant => assistant.assistantId === thread.assistantId);
            if (assistant) {
                thread.assistantName = assistant.name;
            }
        });
        res.render("profile/thread", {currentThreadMessages, openThreads, currentThread, currentThreadTitle, listAllAssistants})
    } catch (error) {
        console.log(error)
    }
});


router.post("/thread/createThread", isLoggedIn, async (req, res, next) => {
    try {
        userId = req.session.currentUser._id;
        const message = req.body.message;
        const assistantId = req.body.assistantId;

        //create and run the thread
        const createdThread = await thread.createThreadAndRun(assistantId, message);
        const threadId = createdThread.thread_id;
        const runId = createdThread.id;
        let threadTitle = await threadSummarizer(message);
        threadTitle = threadTitle.replace(/^"|"$/g, '');
        console.log(threadTitle)

        const newThread = await Thread.create({
            threadId: createdThread.thread_id,
            assistantId: assistantId,
            threadTitle: threadTitle,
            userId: userId,
        });

        await threadMessages.create({
            thread_db_reference_id: newThread._id,
            role: "user",
            message: message,
            userId: userId,
        });

        //wait and check for the status to complete
        let status = await thread.retrieveRun(threadId, runId);
        while (status.status != "completed") {
            await sleep(500);
            status = await thread.retrieveRun(threadId, runId);
            console.log(status.status)

            if (status.status === 'failed'){
                break;
            }
        }

        // Upload the response from the API to the DB and redirect
        if (status.status === 'completed') {
            try {
                const allThreadMessages = await thread.listMessages(threadId)
                await threadMessages.create({
                    thread_db_reference_id: newThread._id,
                    role: "assistant",
                    message: allThreadMessages.data[0].content[0].text.value,
                    userId: userId,
                });
                res.redirect(`/thread/${threadId}`);
            } catch (error) {
                console.log(error)
            }
        }

        if (status.status === 'failed'){
            res.render(`profile/thread`, {error: "API Req. failed"})
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
        
        const threadDb = await Thread.findOne({threadId})

        await threadMessages.create({
            thread_db_reference_id: threadDb._id,
            role: "user",
            message: req.body.message,
            userId: userId,
        });

        const runThread = await thread.runThread(threadId, threadDb.assistantId);
        let status = await thread.retrieveRun(threadId, runThread.id);
        while (status.status !== "completed" && status.status !== "failed") {
            await sleep(500);
            status = await thread.retrieveRun(threadId, runThread.id);
            console.log(status.status);
        }        

        if (status.status === 'completed') {
            try {
                const allThreadMessages = await thread.listMessages(threadId)
                await threadMessages.create({
                    thread_db_reference_id: threadDb._id,
                    role: "assistant",
                    message: allThreadMessages.data[0].content[0].text.value,
                    userId: userId,
                });
                res.redirect(`/thread/${threadId}`);
            } catch (error) {
                console.log(error)
            }
        } else if (status.status === 'failed'){
            res.render(`profile/thread`, {error: "API Req. failed"})
        }

    } catch (error) {
        console.error('Error creating assistant:', error);
        next(error);
    }
    console.log(req.body)
})


/* router.post("/thread/loadMessages", isLoggedIn, async (req, res, next) => {
    try {
        const threadId = req.body.thread_id;
        const threadMessages = await thread.listMessages(threadId);

        res.render("profile/thread", {threadMessages})
    } catch (error) {
        console.error('Error creating assistant:', error);
        next(error);
    }
}) */


/* router.post("/thread/runThread", isLoggedIn, async (req, res, next) => {
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
}) */


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