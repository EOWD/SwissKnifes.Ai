const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { isLoggedIn, isLoggedOut } = require("../middleware/route-guard.js");
const VanillaAssistant = require('../classes/Assistant.class.js');
const Assistant = require("../models/Assistant.model.js");

const openaiApikey = process.env.OPENAI_API_KEY;
const assistantInstance = new VanillaAssistant(openaiApikey);
let userId = "";


router.get("/assistant", isLoggedIn, async (req, res) => {
    try {
        userId = req.session.currentUser._id;
        const listAllAssistants = await assistantInstance.listAssistants();
        const selectedAssistant = listAllAssistants[0] ? listAllAssistants[0].id : "";
        const listOpenaiAssistants = await assistantInstance.listOpenaiAssistants()
        res.render("profile/assistant", {listAll: listAllAssistants, selectedAssistant, listOpenaiAssistants});
    } catch (error) {
        console.log(error)
    }
});

router.post("/assistant/newAssistant", isLoggedIn, async (req, res, next) => {
    try {
        const toolsFormatted = req.body.tools.map(tool => {
            return { type: tool };
        });

        const createAssistantResponse = await assistantInstance.createAssistant(req.body.name, req.body.description, req.body.instructions, toolsFormatted, req.body.model);

        await Assistant.create({
            assistantId: createAssistantResponse.id,
            name: createAssistantResponse.name,
            model: createAssistantResponse.model,
            description: createAssistantResponse.description,
            instructions: createAssistantResponse.instructions,
        });

        const listAllAssistants = await assistantInstance.listAssistants();
        res.render("profile/assistant", { response: createAssistantResponse, listAll: listAllAssistants });
    } catch (error) {
        console.error('Error creating assistant:', error);
        next(error);
    }
})


router.get("/assistant/:id/edit", isLoggedIn, async (req, res) => {
    try {
        userId = req.session.currentUser._id;
        const assistantId = req.params.id
        
        const asssistantData = await assistantInstance.retrieveAssistant(assistantId)
        console.log(asssistantData)

        res.render("profile/modifyAssistant", {asssistantData});
    } catch (error) {
        console.log(error)
    }
});


router.get("/assistant/delete/:id", isLoggedIn, async (req, res, next) => {
    const threadId = req.params.id;

    try {
        const deletedThread = await assistantInstance.deleteAssistant(threadId);
        await Assistant.findOneAndDelete({ assistantId: threadId })
        res.redirect('/assistant')
    } catch (error) {
        console.error('Error deleting assistant:', error);
        next(error);
    }
})

module.exports = router;